import { MdFileDownload } from "react-icons/md";
import banner1 from "../../../../assets/images/banner1.jpg";

const Banner = () => {
  return (
    <div className="banner bg-no-repeat bg-cover bg-center h-[600px] relative " style={{ backgroundImage: `url(${banner1})` }}>
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="banner_con w-full md:w-[45%] relative z-10">
          <div className="text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight font-lato">
              Welcome to Shaktishree!
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-90 pr-[100px] font-lato">
              Join Shaktishree and unlock your potential through skill,
              strength, and self-confidence.
            </p>
            <div className="pt-4">
              <a
                href="#"
                className="inline-flex items-center bg-[#0D5A97] text-white font-semibold text-lg rounded shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 space-x-2 px-3 py-1.5"
              >
                <span>Download</span>
                <MdFileDownload className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;