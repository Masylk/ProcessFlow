// app/dashboard/upload/page.tsx

import Head from 'next/head';

export default function UploadImageModal() {
  return (
    <>
      <Head>
        <title>Upload Profile Picture</title>
        <meta
          name="description"
          content="Drop an image here or click to upload your profile picture."
        />
      </Head>

      <main className="relative flex items-center justify-center min-h-screen bg-gray-100">
        {/* Background Overlay with Backdrop Blur (Only Behind Modal) */}
        <div className="fixed inset-0 bg-[#0c111d] opacity-70 backdrop-blur-lg z-0"></div>

        {/* Modal */}
        <div className="relative z-10 w-[480px] bg-white rounded-xl shadow-lg flex flex-col justify-start items-center overflow-hidden">
          <div className="w-full h-40 flex flex-col justify-start items-center">
            <div className="w-full h-[140px] px-6 pt-6 flex flex-col justify-start items-start gap-4">
              {/* Image Icon */}
              <div className="w-12 h-12 p-3 bg-white rounded-[10px] shadow border border-[#e4e7ec] flex justify-center items-center overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/image-03.svg`}
                  alt="Image Icon"
                  className="w-6 h-6"
                />
              </div>
              <div className="w-full flex flex-col justify-start items-start gap-1">
                <h2 className="text-[#101828] text-lg font-semibold">
                  Drop an image here or click to upload
                </h2>
                <p className="text-[#475467] text-sm font-normal">
                  Upload your profile picture
                </p>
              </div>
            </div>
          </div>

          {/* Upload Area with Inside Border (2px) */}
          <div className="w-full h-[126px] px-6 flex flex-col justify-start items-start gap-5">
            <div className="w-full h-[126px] flex flex-col justify-start items-start gap-4">
              <div className="w-full h-[126px] px-6 py-4 bg-white rounded-xl border-2 border-[#e4e7ec] flex flex-col justify-start items-center gap-1 group transition-all duration-300 hover:border-[#4e6bd7]">
                <div className="w-full h-[94px] flex flex-col justify-start items-center gap-3">
                  {/* Upload Icon */}
                  <div className="w-10 h-10 p-2.5 bg-white rounded-lg shadow border border-[#e4e7ec] flex justify-center items-center overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-cloud-02.svg`}
                      alt="Upload Cloud"
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="w-full flex flex-col justify-start items-center gap-1">
                    <div className="flex justify-center items-start gap-1">
                      <span className="text-[#374c99] text-sm font-semibold cursor-pointer transition-all duration-300 hover:text-[#2B3B76]">
                        Click to upload
                      </span>
                      <span className="text-[#475467] text-sm font-normal">
                        or drag and drop
                      </span>
                    </div>
                    <p className="text-center text-[#475467] text-xs font-normal">
                      SVG, PNG, JPG or GIF (max. 800x400px)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="w-full h-[100px] pt-8 flex flex-col justify-start items-start">
            <div className="w-full px-6 pb-6 flex items-center gap-3">
              {/* Cancel Button */}
              <button className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow border border-[#d0d5dd] flex justify-center items-center gap-1.5 transition-all duration-300 hover:bg-[#F9FAFB]">
                <span className="text-[#344054] text-base font-semibold">
                  Cancel
                </span>
              </button>

              {/* Save Button (Fixed Blue Issue) */}
              <button className="w-full h-11 px-4 py-2.5 bg-[#4E6BD7] bg-opacity-100 rounded-lg shadow-md border-none flex justify-center items-center gap-1.5 transition-all duration-300 hover:bg-[#3B55B5]">
                <span className="text-white text-base font-semibold">Save</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
