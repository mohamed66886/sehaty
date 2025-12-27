import { StudentIcon, TrophyIcon, MedalIcon, TrendingUpIcon, CheckIcon, StarIcon } from "@/components/icons/Icons";

export default function TopStudents() {
  const students = [
    {
      name: "أحمد محمد",
      grade: "الصف الثالث الإعدادي",
      icon: <StudentIcon className="w-16 h-16" />,
      achievement: "المركز الأول",
      score: 98.5,
      subjects: ["رياضيات", "علوم", "لغة عربية"]
    },
    {
      name: "فاطمة أحمد",
      grade: "الصف الثاني الإعدادي",
      icon: <StudentIcon className="w-16 h-16" />,
      achievement: "المركز الثاني",
      score: 97.8,
      subjects: ["علوم", "لغة إنجليزية"]
    },
    {
      name: "محمود حسن",
      grade: "الصف الثالث الإعدادي",
      icon: <StudentIcon className="w-16 h-16" />,
      achievement: "المركز الثالث",
      score: 96.5,
      subjects: ["رياضيات", "لغة إنجليزية"]
    },
    {
      name: "نور علي",
      grade: "الصف الأول الإعدادي",
      icon: <StudentIcon className="w-16 h-16" />,
      achievement: "الأكثر تحسناً",
      score: 95.2,
      subjects: ["لغة عربية", "علوم"]
    },
    {
      name: "يوسف خالد",
      grade: "الصف الثاني الإعدادي",
      icon: <StudentIcon className="w-16 h-16" />,
      achievement: "الأفضل حضوراً",
      score: 94.8,
      subjects: ["رياضيات", "علوم"]
    },
    {
      name: "مريم سعيد",
      grade: "الصف الأول الإعدادي",
      icon: <StudentIcon className="w-16 h-16" />,
      achievement: "الأكثر تفاعلاً",
      score: 94.5,
      subjects: ["لغة عربية", "لغة إنجليزية"]
    }
  ];

  const badges = [
    { icon: <TrophyIcon className="w-10 h-10" />, label: "الأول على المركز", color: "from-yellow-400 to-yellow-600" },
    { icon: <MedalIcon className="w-10 h-10" />, label: "الثاني على المركز", color: "from-gray-300 to-gray-500" },
    { icon: <MedalIcon className="w-10 h-10" />, label: "الثالث على المركز", color: "from-orange-400 to-orange-600" },
    { icon: <TrendingUpIcon className="w-10 h-10" />, label: "الأكثر تحسناً", color: "from-green-400 to-green-600" },
    { icon: <CheckIcon className="w-10 h-10" />, label: "الأفضل حضوراً", color: "from-blue-400 to-blue-600" },
    { icon: <StarIcon className="w-10 h-10" />, label: "الأكثر تفاعلاً", color: "from-purple-400 to-purple-600" }
  ];

  return (
    <section id="students" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            الطلاب المميزون
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نفخر بإنجازات طلابنا المتفوقين والمتميزين
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {students.map((student, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Badge */}
              <div className={`bg-gradient-to-r ${badges[index].color} p-4 text-center text-white`}>
                <div className="flex justify-center mb-2">{badges[index].icon}</div>
                <div className="font-bold">{student.achievement}</div>
              </div>

              {/* Student Image */}
              <div className="flex justify-center -mt-12">
                <div className="bg-white rounded-full p-4 shadow-lg border-4 border-white text-primary-600">
                  {student.icon}
                </div>
              </div>
              
              {/* Student Info */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {student.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {student.grade}
                </p>
                
                {/* Score */}
                <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-2 mb-4">
                  <span className="text-primary-600 font-bold text-2xl">{student.score}%</span>
                  <span className="text-gray-600 text-sm">المعدل</span>
                </div>
                
                {/* Subjects */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {student.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivation Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white text-center max-w-4xl mx-auto shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">
            أنت أيضاً يمكنك التميز!
          </h3>
          <p className="text-xl mb-6 opacity-90">
            انضم لمنصتنا وكن من الطلاب المتفوقين
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-center text-lg py-3 px-8"
            >
              سجل الآن
            </a>
            <a
              href="#features"
              className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-primary-600 text-center text-lg py-3 px-8"
            >
              تعرف على المزيد
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
