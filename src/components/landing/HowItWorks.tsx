import { DocumentIcon, UsersIcon, BookIcon, ChartIcon } from "@/components/icons/Icons";

export default function HowItWorks() {
  const steps = [
    {
      step: "1",
      icon: <DocumentIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "إنشاء حساب",
      description: "سجل كمعلم أو ولي أمر وأنشئ حسابك في دقائق"
    },
    {
      step: "2",
      icon: <UsersIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "إضافة الطلاب",
      description: "أضف بيانات الطلاب وربطهم بالمعلمين وأولياء الأمور"
    },
    {
      step: "3",
      icon: <BookIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "إدارة الدراسة",
      description: "سجل الحضور والواجبات والنتائج بشكل منظم"
    },
    {
      step: "4",
      icon: <ChartIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "متابعة التقدم",
      description: "تابع التقدم الأكاديمي من خلال التقارير والإحصائيات"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            كيف تعمل المنصة؟
          </h2>
          
          <div className="w-16 h-1 bg-primary-600 mx-auto mb-6"></div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ابدأ استخدام المنصة في 4 خطوات بسيطة
          </p>
        </div>

        {/* Steps Section */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {steps.map((item, index) => (
              <div 
                key={index} 
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-white rounded-lg p-4 md:p-6 h-full border border-gray-200 hover:border-primary-500 transition-colors duration-300">
                  {/* Step Number */}
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-600 text-white text-base md:text-lg font-bold mb-4 md:mb-6 mx-auto">
                    {item.step}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    {/* Icon Container */}
                    <div className="flex justify-center mb-3 md:mb-4">
                      <div className="text-primary-600">
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base md:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              جاهز للبدء؟
            </h3>
            <p className="text-base text-gray-600 max-w-xl mx-auto mb-8">
              انضم إلى المعلمين وأولياء الأمور الذين يستخدمون منصتنا
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-300"
              >
                ابدأ الآن
              </a>
              
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-primary-600 bg-white border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors duration-300"
              >
                اعرف المزيد
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}