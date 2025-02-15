'use client';

import { useState } from 'react';
import ButtonNormal from '../../components/ButtonNormal';
import ButtonDestructive from '../../components/ButtonDestructive';

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleLoading = () => {
    setIsLoading((prev) => !prev);
    setTimeout(() => setIsLoading(false), 2000); // Simulate loading state for 2 seconds
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-200">
      <div className="flex w-full max-w-5xl gap-16">
        {/* Light Mode Buttons */}
        <div className="flex-1 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center">Light Mode Buttons</h2>
          <div className=" flex flex-col gap-6">
            <ButtonNormal
              variant="primary"
              mode="light"
              size="small"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Create workflow
            </ButtonNormal>
            <ButtonDestructive
              variant="primary"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Primary Destructive</ButtonDestructive>
            <ButtonNormal
              variant="secondaryGray"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Secondary Gray
            </ButtonNormal>
            <ButtonDestructive
              variant="secondary"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Secondary Destructive</ButtonDestructive>
            <ButtonNormal
              variant="secondaryColor"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Secondary Color
            </ButtonNormal>
            <ButtonNormal
              variant="tertiaryGray"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Tertiary Gray
            </ButtonNormal>
            <ButtonDestructive
              variant="tertiary"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Tertiary Destructive</ButtonDestructive>
            <ButtonNormal
              variant="tertiaryColor"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Tertiary Color
            </ButtonNormal>
            <ButtonNormal
              variant="linkGray"
              mode="light"

              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Link Gray
            </ButtonNormal>
            <ButtonDestructive
              variant="link"
              mode="light"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Link Destructive</ButtonDestructive>
            <ButtonNormal
              variant="linkColor"
              mode="light"
              iconColor='red'
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Link Color
            </ButtonNormal>
          </div>
        </div>

        {/* Dark Mode Buttons */}
        <div className="flex-1 bg-black p-8 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-white">Dark Mode Buttons</h2>
          <div className="flex flex-col gap-6">
            <ButtonNormal
              variant="primary"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Primary
            </ButtonNormal>
            <ButtonDestructive
              variant="primary"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Primary Destructive</ButtonDestructive>
            <ButtonNormal
              variant="secondaryGray"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Secondary Gray
            </ButtonNormal>
            <ButtonDestructive
              variant="secondary"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Secondary Destructive</ButtonDestructive>
            <ButtonNormal
              variant="secondaryColor"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Secondary Color
            </ButtonNormal>
            <ButtonNormal
              variant="tertiaryGray"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Tertiary Gray
            </ButtonNormal>
            <ButtonDestructive
              variant="tertiary"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Tertiary Destructive</ButtonDestructive>
            <ButtonNormal
              variant="tertiaryColor"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Tertiary Color
            </ButtonNormal>
            <ButtonNormal
              variant="linkGray"
              mode="dark"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Link Gray
            </ButtonNormal>
            <ButtonDestructive
              variant="link"
              mode="dark"
              size="medium"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            > Link Destructive</ButtonDestructive>
            <ButtonNormal
              variant="linkColor"
              mode="dark"
              leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
              trailingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
            >
              Link Color
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
