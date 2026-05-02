import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { NextResponse } from "next/server";

const dbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

// Revalidate cached response every 60 seconds
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Default payload returned when the server record is missing or unreachable
const OFFLINE_DEFAULTS = {
    id: "SERVER_1",
    serverName: "Project Zomboid Server",
    map: "—",
    onlinePlayers: 0,
    maxPlayers: 0,
    ping: 0,
    status: "OFFLINE" as const,
    timestamp: new Date().toISOString(),
    playersList: [],
};

export async function GET() {
    try {
        const params = {
            TableName: "ZomboidStatus",
            Key: {
                id: { S: "SERVER_1" },
            },
        };

        const { Item } = await dbClient.send(new GetItemCommand(params));

        // If no record exists yet, return defaults so the UI always renders
        if (!Item) {
            return NextResponse.json(
                { success: true, data: OFFLINE_DEFAULTS },
                { status: 200 },
            );
        }

        const serverData = unmarshall(Item);

        return NextResponse.json(
            { success: true, data: serverData },
            { status: 200 },
        );
    } catch (error: any) {
        console.error("[API] Zomboid fetch error:", error.message);

        // Return the offline defaults so the page still renders gracefully
        return NextResponse.json(
            { success: true, data: OFFLINE_DEFAULTS },
            { status: 200 },
        );
    }
}