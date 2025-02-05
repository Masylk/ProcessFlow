// components/UserInfo.tsx

import { User } from '@/types/user';

interface UserInfoProps {
  user: User | null;
}

export default function UserInfo({ user }: UserInfoProps) {
  // Define the default avatar URL using environment variables.
  const defaultAvatar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;

  // Use user.avatar_url if it exists, otherwise fall back to the default avatar.
  const avatarSrc =
    user && user.avatar_signed_url
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${user.avatar_signed_url}`
      : defaultAvatar;

  return (
    <div className="h-16 flex-col border-l border-gray-50 justify-start items-start inline-flex">
      <div className="h-16 px-4 py-3 flex-col justify-start items-start flex">
        <div className="self-stretch justify-start items-center gap-3 inline-flex">
          <div className="w-10 h-10 rounded-full justify-center items-center flex">
            <img
              src={avatarSrc}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
            <div className="self-stretch text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
              {user ? user.full_name : 'Loading...'}
            </div>
            <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
              {user ? user.email : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
