import abtRight from "../../../../assets/images/abtRight.png";
import aboutS from "../../../../assets/images/aboutS.png";
import { FaLongArrowAltRight } from "react-icons/fa";

const About = () => {
  return (
    <div className="about bg-[url('../../../../assets/images/aboutBg.png')] bg-no-repeat bg-cover  py-[100px]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 font-lato">
              About{" "}
              <span className="text-blue-600 inline-flex items-center">
                U
                <img src={aboutS} alt="s" className="ml-1" />
              </span>
            </h2>
            <p className="text-[16px] text-gray-700 leading-relaxed text-justify">
              Shaktishree is a women empowerment initiative launched by the
              Government of Odisha to enhance safety, awareness, and leadership
              among female students across colleges and universities. Under this
              scheme, each institution appoints a woman faculty member as
              the Sanjojika to coordinate the Shaktishree Empowerment Cell.
              These cells actively engage students in awareness campaigns,
              self-defense training, legal literacy sessions, and mental health
              workshops. The programme aims to create a safe and supportive
              academic environment while building confidence, knowledge, and
              life skills among young women. Shaktishree reflects the
              government's commitment to ensuring dignity, security, and equal
              opportunities for every woman student in Odisha.
            </p>

            <div className="pt-4">
              <a
                href="#"
                className="inline-flex items-center bg-[#0D5A97] text-white font-semibold text-lg rounded shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 space-x-2 px-3 py-1.5"
              >
                <span>Read More</span>
                <FaLongArrowAltRight className="text-xl" />
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[466px] h-[350px]">
              <div className="absolute -bottom-6 -left-6 w-[450px] h-[300px] bg-[#0D5A97] rounded-lg z-0"></div>

              <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl relative z-10">
                <img
                  src={abtRight}
                  alt="Shaktishree Empowerment"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
