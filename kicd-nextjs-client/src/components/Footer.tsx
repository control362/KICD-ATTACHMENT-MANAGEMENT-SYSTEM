export function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="relative w-full pt-16 pb-8 pl-16 pr-gutter bg-[#001b33] text-white font-sans text-base border-t-4 border-primary mt-auto overflow-hidden">
        
        {/* Floating Social Media Bar (Anchored to Footer) */}
        <div className="hidden lg:flex flex-col absolute left-0 top-0 h-full border-r border-[#ffffff20] z-10 bg-[#001b33]">
          <a href="https://www.facebook.com/KICDKenya/" target="_blank" rel="noopener noreferrer" className="w-12 h-16 bg-[#3b5998] text-white flex items-center justify-center hover:bg-[#2d4373] transition-colors">
            <i className="fa-brands fa-facebook-f text-xl"></i>
          </a>
          <a href="https://twitter.com/KICDKenya" target="_blank" rel="noopener noreferrer" className="w-12 h-16 bg-[#00aced] text-white flex items-center justify-center hover:bg-[#0084b4] transition-colors">
            <i className="fa-brands fa-twitter text-xl"></i>
          </a>
          <a href="https://www.youtube.com/@EduTVKenya" target="_blank" rel="noopener noreferrer" className="w-12 h-16 bg-[#ff0000] text-white flex items-center justify-center hover:bg-[#cc0000] transition-colors">
            <i className="fa-brands fa-youtube text-xl"></i>
          </a>
        </div>
        
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pl-4">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full flex-shrink-0 shadow-lg w-20 h-20 overflow-hidden flex items-center justify-center border-2 border-white">
                <img src="/footer-kicd-logo.png" alt="KICD Logo" className="h-full w-full object-contain scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-white">KENYA INSTITUTE OF<br />CURRICULUM DEVELOPMENT</span>
                <span className="text-xs italic text-gray-300 mt-1">"Nurturing Every Learner's Potential"</span>
              </div>
            </div>
            <p className="text-gray-200 leading-relaxed mt-2 text-sm">
              The Kenya Institute of Curriculum Development (KICD) is an Institute established through the KICD Act No. 4 of 2013 of the laws of Kenya.
            </p>
            <div className="flex flex-col gap-1 mt-4 text-sm text-gray-400">
              <p>Developed by Amy, Moses and Reagan</p>
              <p>© 2026 Kenya Institute of Curriculum Development. All Rights Reserved</p>
            </div>
          </div>

          {/* Column 2: External Links */}
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-lg uppercase tracking-wider mb-2 text-white">External Links</h3>
            <ul className="flex flex-col gap-4">
              <li><a href="https://www.education.go.ke/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Ministry of Education</a></li>
              <li><a href="https://www.knec.ac.ke/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Kenya National Examinations Council</a></li>
              <li><a href="https://www.tsc.go.ke/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Teachers Service Commission Kenya</a></li>
              <li><a href="https://www.kise.ac.ke/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Kenya Institute of Special Education (KISE)</a></li>
              <li><a href="https://oer.kicd.ac.ke/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> OER Portal</a></li>
              <li><a href="https://www.tveta.go.ke/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> TVET Authority</a></li>
              <li><a href="https://elimika.ac.ke/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Elimika</a></li>
              <li><a href="https://kicd.ac.ke/cbc-conference/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> CBC Conference</a></li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-lg uppercase tracking-wider mb-2 text-white">Quick Links</h3>
            <ul className="flex flex-col gap-4">
              <li><a href="https://kicd.ac.ke/contact-us/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Contact Us</a></li>
              <li><a href="https://kicd.ac.ke/kicd-faqs/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> KICD FAQs</a></li>
              <li><a href="https://kicd.ac.ke/speeches-presentations/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Speeches & Presentations</a></li>
              <li><a href="https://kicd.ac.ke/tenders/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white transition-colors flex items-center gap-3 text-sm"><span className="text-blue-400 text-sm">❯</span> Tenders</a></li>
            </ul>
          </div>

          {/* Column 4: Our Contacts */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-lg uppercase tracking-wider mb-1 text-white">Our Contacts</h3>
            
            <div className="text-sm text-gray-200 flex flex-col gap-1.5">
              <p className="font-bold text-white mb-1">Kenya Institute of Curriculum Development</p>
              <p>Desai Rd, Off Muranga Rd,</p>
              <p>Nairobi, Kenya.</p>
            </div>
            
            <div className="text-sm text-gray-200 flex flex-col gap-1.5">
              <p className="font-bold text-white mb-1">Telephone Contacts</p>
              <p>0748029186</p>
              <p>0748029681</p>
              <p>KICD Bookshop</p>
              <p>0748028763</p>
            </div>
            
            <div className="text-sm text-gray-200 flex flex-col gap-1.5">
              <p className="font-bold text-white mb-1">Email Address</p>
              <p><a href="mailto:info@kicd.ac.ke" className="hover:text-white transition-colors">info@kicd.ac.ke</a></p>
            </div>
            
            {/* Social Icons inside Footer */}
            <div className="flex gap-5 mt-8 justify-start w-full">
              <a href="https://www.facebook.com/KICDKenya/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#3b5998] transition-colors"><i className="fa-brands fa-facebook-f text-2xl"></i></a>
              <a href="https://twitter.com/KICDKenya" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00aced] transition-colors"><i className="fa-brands fa-twitter text-2xl"></i></a>
              <a href="https://www.youtube.com/@EduTVKenya" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff0000] transition-colors"><i className="fa-brands fa-youtube text-2xl"></i></a>
            </div>
          </div>
          
        </div>
      </footer>
    </>
  );
}
