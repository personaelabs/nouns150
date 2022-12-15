import { Dialog } from "@headlessui/react";
import ReactMarkdown from "react-markdown";
import styles from "./Modal.module.css";
import CommentView from "../commentView";
import CommentWriter from "../commentWriter";
import { PropCommentsPayload } from "../../types/api";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";

interface IModalProps {
  isOpen: boolean;
  propId: number;
  handleClose: (isOpen: boolean) => void;
  description: string;
}

const getPropComments = (propId: number) => async () =>
  (
    await axios.get<PropCommentsPayload>("/api/getPropComments", {
      params: {
        propId,
      },
    })
  ).data;

const Modal: React.FC<IModalProps> = ({
  isOpen,
  handleClose,
  propId,
  description,
}) => {
  const { isLoading, data } = useQuery<PropCommentsPayload>({
    queryKey: [`${propId}_comments`],
    queryFn: getPropComments(propId),
    retry: 1,
    enabled: isOpen,
    staleTime: 1000,
  });

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* This is the actual modal and it's contents */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-5xl bg-white">
            <div className="">
              <div className="px-4 py-3 md:px-12 md:py-10 md:pb-80">
                <div className="flex justify-end sm:hidden">
                  <button
                    className="w-fit border font-bold bg-black border-black text-white rounded-full px-1.5"
                    onClick={handleClose as any}
                  >
                    X
                  </button>
                </div>

                <ReactMarkdown className={styles.markdown}>
                  {description}
                </ReactMarkdown>
              </div>
              <div className="relative">
                <div className="bg-gray-50 border-t border-gray-200 py-8 pb-16 space-y-4 fixed bottom-0 max-h-80 overflow-scroll w-full max-w-5xl">
                  {isLoading || !data ? (
                    <ClipLoader color="hsla(168, 9%, 52%, 1)" />
                  ) : data.comments.length !== 0 ? (
                    data.comments.map((comment) => (
                      <CommentView
                        key={comment.id}
                        createdAt={comment.createdAt}
                        groupType={Number(comment.groupType)}
                        message={comment.commentMsg}
                        proof={comment.ipfsProof}
                      />
                    ))
                  ) : (
                    <div className="py-1 px-2 flex row items-center justify-center">
                      <p className="text-l">No comments yet!</p>
                    </div>
                  )}
                  <CommentWriter propId={propId} />
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
