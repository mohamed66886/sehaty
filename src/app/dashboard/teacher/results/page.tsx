'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3, TrendingUp, TrendingDown, Award, FileText } from 'lucide-react';
import { useState } from 'react';

export default function TeacherResultsPage() {
  const [selectedGrade, setSelectedGrade] = useState('all');

  // Example results data
  const results = [
    {
      id: 1,
      examName: 'امتحان الشهر - أكتوبر',
      grade: 'الصف الأول الثانوي',
      date: '2024-10-15',
      totalStudents: 25,
      submitted: 25,
      avgScore: 82,
      highestScore: 98,
      lowestScore: 55,
      passRate: 88,
    },
    {
      id: 2,
      examName: 'امتحان نصف الفصل',
      grade: 'الصف الثاني الثانوي',
      date: '2024-11-20',
      totalStudents: 20,
      submitted: 18,
      avgScore: 75,
      highestScore: 95,
      lowestScore: 48,
      passRate: 72,
    },
    {
      id: 3,
      examName: 'اختبار قصير',
      grade: 'الصف الثالث الثانوي',
      date: '2024-12-05',
      totalStudents: 18,
      submitted: 18,
      avgScore: 88,
      highestScore: 100,
      lowestScore: 70,
      passRate: 94,
    },
  ];

  const topPerformers = [
    { name: 'أحمد محمد', grade: 'الصف الأول الثانوي', avgScore: 95 },
    { name: 'فاطمة علي', grade: 'الصف الثاني الثانوي', avgScore: 93 },
    { name: 'محمد حسن', grade: 'الصف الثالث الثانوي', avgScore: 92 },
    { name: 'سارة أحمد', grade: 'الصف الأول الثانوي', avgScore: 91 },
  ];

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">النتائج</h1>
            <p className="text-gray-600 mt-1">نتائج الامتحانات والاختبارات</p>
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الصفوف</option>
            <option value="1">الصف الأول الثانوي</option>
            <option value="2">الصف الثاني الثانوي</option>
            <option value="3">الصف الثالث الثانوي</option>
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي الامتحانات</p>
                <p className="text-3xl font-bold mt-2">{results.length}</p>
              </div>
              <FileText size={40} className="text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">متوسط النجاح</p>
                <p className="text-3xl font-bold mt-2">
                  {Math.round(results.reduce((acc, r) => acc + r.passRate, 0) / results.length)}%
                </p>
              </div>
              <TrendingUp size={40} className="text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">متوسط الدرجات</p>
                <p className="text-3xl font-bold mt-2">
                  {Math.round(results.reduce((acc, r) => acc + r.avgScore, 0) / results.length)}%
                </p>
              </div>
              <BarChart3 size={40} className="text-purple-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">إجمالي الطلاب</p>
                <p className="text-3xl font-bold mt-2">
                  {results.reduce((acc, r) => acc + r.totalStudents, 0)}
                </p>
              </div>
              <Award size={40} className="text-orange-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">تفاصيل النتائج</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">الامتحان</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">الصف</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">التاريخ</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">الطلاب</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">المتوسط</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">الأعلى</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">الأقل</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">النجاح</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{result.examName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{result.grade}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(result.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{result.submitted}/{result.totalStudents}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {result.avgScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {result.highestScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {result.lowestScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {result.passRate >= 80 ? (
                          <TrendingUp size={16} className="text-green-600" />
                        ) : (
                          <TrendingDown size={16} className="text-red-600" />
                        )}
                        <span className={`font-medium ${result.passRate >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.passRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-500 to-orange-500">
            <div className="flex items-center gap-2">
              <Award className="text-white" size={24} />
              <h3 className="text-lg font-bold text-white">الطلاب المتفوقون</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topPerformers.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.grade}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-orange-600">{student.avgScore}%</p>
                    <p className="text-xs text-gray-500">متوسط الدرجات</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
