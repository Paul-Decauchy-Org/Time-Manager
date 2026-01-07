import { UserModal } from "./user-modal";

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <UserModal />
    </>
  );
}
