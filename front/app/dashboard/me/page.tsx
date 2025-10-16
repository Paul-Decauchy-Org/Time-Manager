import { ProfileInfo } from "@/app/dashboard/me/profile-info";
import { DeleteAccount } from "@/app/dashboard/me/delete-account";

export default function Me() {
  return (
    <div className="flex flex-col justify-center items-centerflex-col gap-4 p-4 pt-0">
      <div className="max-w-4/5 min-w-4/5 m-auto">
        <ProfileInfo />
      </div>
      <div className="max-w-4/5 min-w-4/5 m-auto">
        <DeleteAccount />
      </div>
    </div>
  );
}
