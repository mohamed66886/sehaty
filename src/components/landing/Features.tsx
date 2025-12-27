'use client';

import { ChartIcon, BellIcon, LockIcon, MobileIcon, CheckIcon, NoteIcon, TrendingUpIcon, ChatIcon, TargetIcon } from "@/components/icons/Icons";

export default function Features() {
  const features = [
    {
      icon: <ChartIcon className="w-8 h-8" />,
      title: "تقارير شاملة",
      description: "تقارير مفصلة عن الحضور، الواجبات، والنتائج لكل طالب",
      color: "from-blue-500 to-blue-600",
      hoverColor: "group-hover:from-blue-600 group-hover:to-blue-700"
    },
    {
      icon: <BellIcon className="w-8 h-8" />,
      title: "إشعارات فورية",
      description: "إشعارات لحظية لأولياء الأمور عن كل ما يخص أبنائهم",
      color: "from-green-500 to-green-600",
      hoverColor: "group-hover:from-green-600 group-hover:to-green-700"
    },
    {
      icon: <LockIcon className="w-8 h-8" />,
      title: "أمان عالي",
      description: "حماية البيانات وصلاحيات محددة لكل مستخدم",
      color: "from-purple-500 to-purple-600",
      hoverColor: "group-hover:from-purple-600 group-hover:to-purple-700"
    },
    {
      icon: <MobileIcon className="w-8 h-8" />,
      title: "متجاوب مع الجوال",
      description: "استخدم المنصة من أي جهاز - كمبيوتر، تابلت، أو موبايل",
      color: "from-pink-500 to-pink-600",
      hoverColor: "group-hover:from-pink-600 group-hover:to-pink-700"
    },
    {
      icon: <CheckIcon className="w-8 h-8" />,
      title: "تسجيل الحضور",
      description: "تسجيل سهل وسريع لحضور وغياب الطلاب مع إشعارات فورية",
      color: "from-yellow-500 to-yellow-600",
      hoverColor: "group-hover:from-yellow-600 group-hover:to-yellow-700"
    },
    {
      icon: <NoteIcon className="w-8 h-8" />,
      title: "إدارة الواجبات",
      description: "إضافة ومتابعة الواجبات وتقييمها بسهولة",
      color: "from-red-500 to-red-600",
      hoverColor: "group-hover:from-red-600 group-hover:to-red-700"
    },
    {
      icon: <TrendingUpIcon className="w-8 h-8" />,
      title: "متابعة التقدم",
      description: "رسوم بيانية توضح تقدم الطالب الأكاديمي",
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "group-hover:from-indigo-600 group-hover:to-indigo-700"
    },
    {
      icon: <ChatIcon className="w-8 h-8" />,
      title: "التواصل المباشر",
      description: "تواصل سهل بين المعلمين وأولياء الأمور",
      color: "from-teal-500 to-teal-600",
      hoverColor: "group-hover:from-teal-600 group-hover:to-teal-700"
    },
    {
      icon: <TargetIcon className="w-8 h-8" />,
      title: "إدارة الامتحانات",
      description: "جدولة الامتحانات وتسجيل النتائج بكل سهولة",
      color: "from-orange-500 to-orange-600",
      hoverColor: "group-hover:from-orange-600 group-hover:to-orange-700"
    }
  ];

  return (
    <section id="features" className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-4 relative z-10">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block mb-3 sm:mb-4">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-semibold">
              لماذا تختار حصتي؟
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 px-4">
            المميزات
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            كل ما تحتاجه لإدارة مركزك التعليمي في منصة واحدة متكاملة
          </p>
        </div>

        {/* بطاقات المميزات */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-16 sm:mb-20 px-2 sm:px-0">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 hover:border-transparent relative overflow-hidden"
            >
              {/* تأثير الخلفية عند الهوفر */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* الأيقونة */}
                <div className={`text-white mb-3 sm:mb-4 lg:mb-6 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.color} ${feature.hoverColor} shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <div className="scale-75 sm:scale-90 lg:scale-100">
                    {feature.icon}
                  </div>
                </div>
                
                {/* المحتوى */}
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 text-gray-900 group-hover:text-primary-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-base lg:text-lg group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* خط زخرفي */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* قسم المعلومات الإضافية */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mx-2 sm:mx-0">
          <div className="p-6 sm:p-10 md:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="lg:w-2/3 text-center lg:text-right">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                  هل أنت مستعد للتحول الرقمي؟
                </h3>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  انضم إلى مئات المراكز التعليمية التي حسّنت جودة التعليم وزادت كفاءة الإدارة من خلال منصتنا المتكاملة
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto lg:w-auto">
                <button className="px-6 sm:px-7 py-3 bg-white text-primary-700 font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base">
                  طلب عرض توضيحي
                </button>
                <button className="px-6 sm:px-7 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-sm sm:text-base">
                  تواصل معنا
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
