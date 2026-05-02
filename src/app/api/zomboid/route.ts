import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { NextResponse } from "next/server";

// 1. ตั้งค่าเชื่อมต่อ AWS แบบปลอดภัย (กุญแจจะถูกซ่อนอยู่ฝั่ง Server เท่านั้น!)
const dbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

// 2. ลอจิก Senior (Trade-off): บังคับ Cache ข้อมูลไว้ 60 วินาที
export const revalidate = 60;

export async function GET() {
    try {
        const params = {
            TableName: "ZomboidStatus",
            Key: {
                id: { S: "SERVER_1" } // ชี้เป้าไปที่ Row เดียวกับที่สปายเราเขียนไว้
            }
        };

        // 3. ยิงคำสั่งดึงข้อมูล
        const { Item } = await dbClient.send(new GetItemCommand(params));

        if (!Item) {
            return NextResponse.json({ error: "ไม่พบข้อมูลเซิร์ฟเวอร์" }, { status: 404 });
        }

        // 4. แปลงภาษาต่างดาวของ DynamoDB กลับเป็น JSON ปกติ
        const serverData = unmarshall(Item);

        return NextResponse.json({ success: true, data: serverData }, { status: 200 });

    } catch (error: any) {
        console.error("❌ [API Error]:", error.message);
        return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว", details: error.message }, { status: 500 });
    }
}