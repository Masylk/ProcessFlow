// app/dashboard/account/page.tsx

import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Confirm Delete</title>
        <meta name="description" content="Please enter your password to delete your account." />
      </Head>

      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        {/* Modal Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          {/* Modal Content */}
          <div className="h-[342.67px] bg-white rounded-xl shadow-lg flex-col justify-start items-center inline-flex overflow-hidden">
            <div className="self-stretch h-[242.67px] flex-col justify-start items-center flex">
              <div className="self-stretch h-[242.67px] px-6 pt-6 flex-col justify-start items-start gap-4 flex">
                {/* Featured Icon (Trash Delete Icon in Red Background) */}
                <div className="w-12 h-12 p-3 bg-[#fee3e1] rounded-full justify-center items-center inline-flex overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-delete.svg`}
                    alt="Trash Delete Icon"
                    className="w-6 h-6"
                  />
                </div>
                <div className="self-stretch h-[52px] flex-col justify-start items-start gap-1 flex">
                  <div className="self-stretch text-[#101828] text-lg font-semibold leading-7">Confirm delete</div>
                  <div className="self-stretch text-[#475467] text-sm font-normal leading-tight">
                    Please enter your password to delete your account.
                  </div>
                </div>
                <div className="h-[86.67px] relative">
                  {/* Alert Box with Supabase Warning Icon */}
                  <div className="w-[352px] h-[42.67px] p-2 bg-[#fff9eb] rounded-lg border border-[#db6803] justify-start items-center gap-2 inline-flex">
                    <div className="w-[26.67px] h-[26.67px] p-[6.67px] bg-[#feefc6] rounded-full justify-center items-center flex overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/alert-circle-warning.svg`}
                        alt="Warning Icon"
                        className="w-[13.33px] h-[13.33px]"
                      />
                    </div>
                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-3 inline-flex">
                      <div className="self-stretch h-5 flex-col justify-start items-start gap-1 flex">
                        <div className="self-stretch justify-start items-start gap-2 inline-flex">
                          <div className="grow shrink basis-0 text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
                            Please note that this action is irreversible.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[352px] h-9 mt-3">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full px-3 py-2 bg-white rounded-lg shadow-sm border border-[#d0d5dd] text-[#667085] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch h-[100px] pt-8 flex-col justify-start items-start flex">
              <div className="self-stretch px-6 pb-6 flex items-center gap-3">
                {/* Cancel Button with Hover Effect */}
                <button className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow border border-[#d0d5dd] flex justify-center items-center gap-1.5 transition-all duration-300 hover:bg-[#F9FAFB]">
                  <span className="text-[#344054] text-base font-semibold">Cancel</span>
                </button>

                {/* Delete Account Button with Hover Effect */}
                <button className="w-full h-11 px-4 py-2.5 bg-[#d92c20] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#901f17] flex justify-center items-center gap-1.5 transition-all duration-300 hover:bg-[#B42318]">
                  <span className="text-white text-base font-semibold font-['Inter'] leading-normal">Delete account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
