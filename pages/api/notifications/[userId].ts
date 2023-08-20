import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(404).end();
    }

    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            throw new Error("Invalid Id");
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc'
            }

        });


        await prisma.user.update({
            where:{
               id:userId
            },
            data:{
                hasNotification:false,
            }
        })

        return res.status(200).json({ notifications });
    } catch (error) {
        return res.status(400).end();
    }
}
