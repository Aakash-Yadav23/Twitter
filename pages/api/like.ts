import { NextApiRequest, NextApiResponse } from "next";

import prisma from '@/libs/prismadb';
import serverAuth from "@/libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).end();
    }

    try {

        if (req.method === 'POST') {

        const { postId } = req.body;

        const { currentUser } = await serverAuth(req, res);

        if (!postId || typeof postId !== 'string') {
            throw new Error('Invalid ID');
        }

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });

        if (!post) {
            throw new Error('Invalid ID');
        }

        let updatedLikedIds = [...(post.likeIds || [])];

            updatedLikedIds.push(currentUser.id);

            // NOTIFICATION PART START
            try {
                const post = await prisma.post.findUnique({
                    where: {
                        id: postId,
                    }
                });

                if (post?.userId) {
                    await prisma.notification.create({
                        data: {
                            body: `${currentUser.username} liked your tweet!`,
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
                return (error)
            }

            const updatedPost = await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    likeIds: updatedLikedIds
                }
            });
            // NOTIFICATION PART END
            return res.status(200).json(updatedPost);

        }

        if (req.method === 'DELETE') {
            const { postId } = req.query;

          
            const { currentUser } = await serverAuth(req, res);

            if (!postId || typeof postId !== 'string') {
                throw new Error('Invalid ID');
            }

            const post = await prisma.post.findUnique({
                where: {
                    id: postId
                }
            });

            if (!post) {
                throw new Error('Invalid ID');
            }

            let updatedLikedIds = [...(post.likeIds || [])];

            updatedLikedIds = updatedLikedIds.filter((likedId) => likedId !== currentUser?.id);
            const updatedPost = await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    likeIds: updatedLikedIds
                }
            });
            return res.status(200).json(updatedPost);

        }


    } catch (error) {
        return res.status(400).end();
    }
}