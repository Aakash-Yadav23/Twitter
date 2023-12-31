import prisma from '@/libs/prismadb';
import serverAuth from '@/libs/serverAuth';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method != "POST") {
        return res.status(404).end()
    }
    try {
        const { currentUser } = await serverAuth(req, res);
        const { postId } = req.query;
        const { body } = req.body;

        if (!postId || typeof postId !== 'string') {
            throw new Error('Invalid id');
        }




        const comment = await prisma.comment.create({
            data: {
                body,
                userId: currentUser.id,
                postId: postId
            }

        })
        // Notifications Parts Start Here
        try {
            const post = await prisma.post.findUnique({
                where: {
                    id: postId,
                }
            });

            if (post?.userId) {
                await prisma.notification.create({
                    data: {
                        body: `${currentUser.username} Commented on Your  tweet!`,
                        userId: post.userId
                    }
                });

                await prisma.user.update({
                    where: {
                        id: post.userId
                    },
                    data: {
                        hasNotification: true
                    }
                });
            }
        } catch (error) {
            throw error;
        }

        return res.status(200).json(comment)


    } catch (error) {
        return res.status(400).end()

    }



}