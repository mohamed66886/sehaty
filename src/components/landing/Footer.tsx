import Link from "next/link";
import { BookIcon, EmailIcon, PhoneIcon, LocationIcon } from "@/components/icons/Icons";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookIcon className="w-6 h-6" />
              <h3 className="text-xl font-bold">حصتي</h3>
            </div>
            <p className="text-gray-400 mb-4">
              منصة تعليمية متكاملة لإدارة المراكز التعليمية ومتابعة الطلاب لحظة بلحظة
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="text-gray-400 hover:text-white transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                  المميزات
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  طريقة الاستخدام
                </a>
              </li>
              <li>
                <a href="#teachers" className="text-gray-400 hover:text-white transition-colors">
                  المدرسين
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">الخدمات</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">إدارة الطلاب</span>
              </li>
              <li>
                <span className="text-gray-400">تسجيل الحضور</span>
              </li>
              <li>
                <span className="text-gray-400">إدارة الواجبات</span>
              </li>
              <li>
                <span className="text-gray-400">إدارة الامتحانات</span>
              </li>
              <li>
                <span className="text-gray-400">التقارير والإحصائيات</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <EmailIcon className="w-5 h-5" />
                <span className="text-gray-400">info@hesaty.com</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="w-5 h-5" />
                <span className="text-gray-400">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <LocationIcon className="w-5 h-5" />
                <span className="text-gray-400">القاهرة، مصر</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                <span className="text-xl">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                <span className="text-xl">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <span className="text-xl">in</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} حصتي. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
