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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ลอจิก Senior: เปลี่ยนเป็น Function ซะ! เพื่อให้ new Date() ถูกรันใหม่ทุกครั้งที่ถูกเรียกใช้
const getOfflineDefaults = () => ({
    id: "SERVER_1",
    serverName: "Project Zomboid Server",
    map: "—",
    onlinePlayers: 0,
    maxPlayers: 0,
    ping: 0,
    status: "OFFLINE" as const,
    timestamp: new Date().toISOString(), // ตอนนี้เวลามันจะเดินเป็นปัจจุบันแล้ว!
    playersList: [],
});

export async function GET() {
    try {
        const params = {
            TableName: "ZomboidStatus",
            Key: { id: { S: "SERVER_1" } },
        };

        const { Item } = await dbClient.send(new GetItemCommand(params));

        if (!Item) {
            return NextResponse.json(
                { success: true, data: getOfflineDefaults() }, // 🚨 เรียกใช้เป็น Function
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

        return NextResponse.json(
            { success: true, data: getOfflineDefaults() }, // 🚨 เรียกใช้เป็น Function
            { status: 200 },
        );
    }
}