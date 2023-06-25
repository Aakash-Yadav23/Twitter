import axios from "axios";
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

import useCurrentUser from "./useCurrentUser";
import useLoginModal from "./useLoginModal";
import usePost from "./usePost";
import usePosts from "./usePosts";

const useLike = ({ postId, userId }: { postId: string, userId?: string }) => {
    const { data: currentUser } = useCurrentUser();
    const { data: fetchedPost, mutate: mutateFetchedPost } = usePost(postId);
    const { mutate: mutateFetchedPosts } = usePosts(userId);

    const loginModal = useLoginModal();

    const hasLiked = useMemo(() => {
        const list = fetchedPost?.likeIds || [];

        return list.includes(currentUser?.id);
    }, [fetchedPost, currentUser]);

    const toggleLike = useCallback(async () => {
        console.log('post',postId)
        if (!currentUser) {
            return loginModal.onOpen();
        }

        try {
            let request;

            if (hasLiked) {
                console.log("yyy", postId, typeof postId);
                // request = () => axios.delete('/api/like', { data: { postId } });
                // Modify the delete request to include the user ID
                request = () => axios.delete(`/api/like?postId=${postId}&userId?=${userId}`);

            } else {
                request = () => axios.post('/api/like', { postId: postId });
            }

            await request();
            mutateFetchedPost();
            mutateFetchedPosts();

            toast.success('Success');
        } catch (error) {
            toast.error('Something went wrong');
        }
    }, [currentUser, hasLiked, postId, mutateFetchedPosts, mutateFetchedPost, loginModal]);


    return {
        hasLiked,
        toggleLike,
    }
}

export default useLike;