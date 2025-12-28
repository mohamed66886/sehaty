"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  Save,
  Check,
  Upload,
} from "lucide-react";
import { Modal, Form, Input, Select, InputNumber, Button } from "antd";
import * as XLSX from "xlsx";

const { TextArea } = Input;
const { Option } = Select;
interface ExamQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer: number | string;
  marks: number;
}
interface Exam {
  id: string;
  teacherId: string;
  title: string;
  classId: string;
  className: string;
  duration: number;
  totalMarks: number;
  startDate: Date;
  endDate: Date;
  questions: ExamQuestion[];
  createdAt: Date;
}
export default function TeacherExamQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(
    null,
  );
  const [form] = Form.useForm();
  useEffect(() => {
    if (user && params.examId) {
      fetchExam();
    }
  }, [user, params.examId]);
  const fetchExam = async () => {
    try {
      const examDoc = await getDoc(doc(db, "exams", params.examId as string));
      if (examDoc.exists()) {
        const data = examDoc.data();
        setExam({
          id: examDoc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
        } as Exam);
      }
    } catch (error) {
      console.error("خطأ في جلب الامتحان:", error);
      Modal.error({
        title: "خطأ",
        content: "فشل في تحميل الامتحان. يرجى المحاولة مرة أخرى.",
        okText: "حسناً",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleOpenModal = (question?: ExamQuestion) => {
    if (question) {
      setEditingQuestion(question);
      form.setFieldsValue({
        question: question.question,
        type: question.type,
        option0: question.options?.[0] || "",
        option1: question.options?.[1] || "",
        option2: question.options?.[2] || "",
        option3: question.options?.[3] || "",
        correctAnswer: question.correctAnswer,
        marks: question.marks,
      });
    } else {
      setEditingQuestion(null);
      form.setFieldsValue({
        question: "",
        type: "multiple-choice",
        option0: "",
        option1: "",
        option2: "",
        option3: "",
        correctAnswer: 0,
        marks: 1,
      });
    }
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    form.resetFields();
  };
  const handleSubmit = async (values: any) => {
    if (!exam) return;
    setLoading(true);
    try {
      const newQuestion: ExamQuestion = {
        id: editingQuestion?.id || `q${Date.now()}`,
        question: values.question,
        type: values.type,
        options:
          values.type === "multiple-choice"
            ? [
                values.option0,
                values.option1,
                values.option2,
                values.option3,
              ].filter((o: string) => o && o.trim())
            : undefined,
        correctAnswer: values.correctAnswer,
        marks: values.marks,
      };
      let updatedQuestions = exam.questions || [];
      if (editingQuestion) {
        updatedQuestions = updatedQuestions.map((q) =>
          q.id === editingQuestion.id ? newQuestion : q,
        );
      } else {
        updatedQuestions.push(newQuestion);
      }
      await updateDoc(doc(db, "exams", exam.id), {
        questions: updatedQuestions,
      });
      await fetchExam();
      handleCloseModal();
      Modal.success({
        title: "نجح",
        content: `تم ${editingQuestion ? "تحديث" : "إضافة"} السؤال بنجاح!`,
        okText: "حسناً",
      });
    } catch (error) {
      console.error("خطأ في حفظ السؤال:", error);
      Modal.error({
        title: "خطأ",
        content: "فشل في حفظ السؤال. يرجى المحاولة مرة أخرى.",
        okText: "حسناً",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (questionId: string) => {
    if (!exam) return;
    Modal.confirm({
      title: "تأكيد الحذف",
      content: "هل أنت متأكد من حذف هذا السؤال؟",
      okText: "نعم، احذف",
      cancelText: "إلغاء",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        try {
          const updatedQuestions = exam.questions.filter(
            (q) => q.id !== questionId,
          );
          await updateDoc(doc(db, "exams", exam.id), {
            questions: updatedQuestions,
          });
          await fetchExam();
          Modal.success({
            title: "نجح",
            content: "تم حذف السؤال بنجاح!",
            okText: "حسناً",
          });
        } catch (error) {
          console.error("خطأ في حذف السؤال:", error);
          Modal.error({
            title: "خطأ",
            content: "فشل في حذف السؤال. يرجى المحاولة مرة أخرى.",
            okText: "حسناً",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !exam) return;
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const importedQuestions: ExamQuestion[] = [];
      for (const row of jsonData as any[]) {
        const correctAnswerKey =
          row["Correct Answer"] || row["CorrectAnswer"] || row["Correct"];
        const choiceA = (row["Choice A"] || row["ChoiceA"] || row["A"] || "")
          .toString()
          .trim();
        const choiceB = (row["Choice B"] || row["ChoiceB"] || row["B"] || "")
          .toString()
          .trim();
        const choiceC = (row["Choice C"] || row["ChoiceC"] || row["C"] || "")
          .toString()
          .trim();
        const choiceD = (row["Choice D"] || row["ChoiceD"] || row["D"] || "")
          .toString()
          .trim();
        const options = [choiceA, choiceB, choiceC, choiceD];
        let correctAnswerIndex = -1;
        if (correctAnswerKey) {
          const answerKey = correctAnswerKey.toString().trim().toUpperCase();
          if (answerKey === "A" && choiceA) correctAnswerIndex = 0;
          else if (answerKey === "B" && choiceB) correctAnswerIndex = 1;
          else if (answerKey === "C" && choiceC) correctAnswerIndex = 2;
          else if (answerKey === "D" && choiceD) correctAnswerIndex = 3;
          else {
            const answerText = correctAnswerKey.toString().trim();
            correctAnswerIndex = options.findIndex(
              (opt) => opt && opt.toLowerCase() === answerText.toLowerCase(),
            );
          }
        }
        const question: ExamQuestion = {
          id: `q${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          question: (row["Question"] || row["question"] || "")
            .toString()
            .trim(),
          type: "multiple-choice",
          options: options.filter((opt) => opt !== ""),
          correctAnswer: correctAnswerIndex,
          marks: parseInt(row["Marks"] || row["marks"] || "1"),
        };
        if (
          question.question &&
          correctAnswerIndex >= 0 &&
          question.options &&
          question.options.length >= 2
        ) {
          importedQuestions.push(question);
        }
      }
      if (importedQuestions.length > 0) {
        const updatedQuestions = [
          ...(exam.questions || []),
          ...importedQuestions,
        ];
        await updateDoc(doc(db, "exams", exam.id), {
          questions: updatedQuestions,
        });
        await fetchExam();
        setShowImportModal(false);
        Modal.success({
          title: "نجح",
          content: `تم استيراد ${importedQuestions.length} سؤال بنجاح!`,
          okText: "حسناً",
        });
      } else {
        Modal.warning({
          title: "تحذير",
          content: "لم يتم العثور على أسئلة صالحة في الملف",
          okText: "حسناً",
        });
      }
    } catch (error) {
      console.error("خطأ في استيراد الأسئلة:", error);
      Modal.error({
        title: "خطأ",
        content: "فشل استيراد الأسئلة. تأكد من تنسيق الملف.",
        okText: "حسناً",
      });
    } finally {
      setLoading(false);
      if (e.target) e.target.value = "";
    }
  };
  if (loading) {
    return (
      <DashboardLayout allowedRoles={["teacher"]}>
        {" "}
        <div className="text-center py-8">
          {" "}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>{" "}
          <p className="mt-4 text-gray-600">جاري التحميل...</p>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  if (!exam) {
    return (
      <DashboardLayout allowedRoles={["teacher"]}>
        {" "}
        <div className="text-center py-8">
          {" "}
          <p className="text-gray-600">لم يتم العثور على الامتحان</p>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout allowedRoles={["teacher"]}>
      {" "}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {" "}
        <button
          onClick={() => router.push("/dashboard/teacher/exams")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6"
        >
          {" "}
          <ChevronLeft className="w-5 h-5" /> العودة للامتحانات{" "}
        </button>{" "}
        <div className="flex items-center justify-between mb-8">
          {" "}
          <div>
            {" "}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {" "}
              {exam.title}{" "}
            </h1>{" "}
            <p className="text-gray-600 dark:text-gray-400">
              {" "}
              إدارة أسئلة الامتحان - الإجمالي: {exam.questions?.length ||
                0}{" "}
              سؤال{" "}
            </p>{" "}
          </div>{" "}
          <div className="flex items-center gap-3">
            {" "}
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary flex items-center gap-2"
            >
              {" "}
              <Plus className="w-5 h-5" /> إضافة سؤال{" "}
            </button>{" "}
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              {" "}
              <Upload className="w-5 h-5" /> استيراد من Excel{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {!exam.questions || exam.questions.length === 0 ? (
          <div className="card text-center py-12">
            {" "}
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {" "}
              لم يتم إضافة أسئلة بعد{" "}
            </p>{" "}
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {" "}
              <Plus className="w-5 h-5" /> إضافة أول سؤال{" "}
            </button>{" "}
          </div>
        ) : (
          <div className="space-y-4">
            {" "}
            {exam.questions.map((question, index) => (
              <div key={question.id} className="card">
                {" "}
                <div className="flex items-start justify-between mb-4">
                  {" "}
                  <div className="flex-1">
                    {" "}
                    <div className="flex items-center gap-3 mb-2">
                      {" "}
                      <span className="text-lg font-bold text-primary-600">
                        {" "}
                        س{index + 1}{" "}
                      </span>{" "}
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                        {" "}
                        {question.type === "multiple-choice"
                          ? "اختيار من متعدد"
                          : question.type === "true-false"
                            ? "صح/خطأ"
                            : "إجابة قصيرة"}{" "}
                      </span>{" "}
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                        {" "}
                        {question.marks}{" "}
                        {question.marks === 1 ? "درجة" : "درجات"}{" "}
                      </span>{" "}
                    </div>{" "}
                    <p className="text-gray-900 dark:text-white mb-3">
                      {" "}
                      {question.question}{" "}
                    </p>{" "}
                    {question.type === "multiple-choice" &&
                      question.options && (
                        <div className="space-y-2">
                          {" "}
                          {question.options.map((option, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded text-sm ${i === question.correctAnswer ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium" : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                            >
                              {" "}
                              {String.fromCharCode(65 + i)}. {option}{" "}
                              {i === question.correctAnswer && (
                                <Check className="w-4 h-4 inline mr-2 text-green-600" />
                              )}{" "}
                            </div>
                          ))}{" "}
                        </div>
                      )}{" "}
                    {question.type === "true-false" && (
                      <div className="text-sm">
                        {" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          الإجابة الصحيحة:{" "}
                        </span>{" "}
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {" "}
                          {question.correctAnswer}{" "}
                        </span>{" "}
                      </div>
                    )}{" "}
                    {question.type === "short-answer" && (
                      <div className="text-sm">
                        {" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          الإجابة:{" "}
                        </span>{" "}
                        <span className="font-medium">
                          {question.correctAnswer}
                        </span>{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                  <div className="flex items-center gap-2 mr-4">
                    {" "}
                    <button
                      onClick={() => handleOpenModal(question)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      {" "}
                      <Edit className="w-4 h-4" />{" "}
                    </button>{" "}
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      {" "}
                      <Trash2 className="w-4 h-4" />{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>
        )}{" "}
      </div>{" "}
      <Modal
        title={editingQuestion ? "تعديل السؤال" : "إضافة سؤال جديد"}
        open={showModal}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="type"
            label="نوع السؤال"
            rules={[{ required: true, message: "يرجى اختيار نوع السؤال" }]}
          >
            <Select
              size="large"
              placeholder="اختر نوع السؤال"
              onChange={(value) => {
                form.setFieldsValue({
                  option0: "",
                  option1: "",
                  option2: "",
                  option3: "",
                  correctAnswer: value === "multiple-choice" ? 0 : "",
                });
              }}
            >
              <Option value="multiple-choice">اختيار من متعدد</Option>
              <Option value="true-false">صح/خطأ</Option>
              <Option value="short-answer">إجابة قصيرة</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="question"
            label="السؤال"
            rules={[{ required: true, message: "يرجى إدخال السؤال" }]}
          >
            <TextArea
              rows={4}
              placeholder="أدخل السؤال"
              size="large"
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {({ getFieldValue }) => {
              const questionType = getFieldValue("type");
              
              if (questionType === "multiple-choice") {
                return (
                  <>
                    <Form.Item label="الخيارات">
                      <div className="space-y-2">
                        <Form.Item
                          name="option0"
                          rules={[{ required: true, message: "يرجى إدخال الخيار أ" }]}
                          className="mb-2"
                        >
                          <Input size="large" placeholder="الخيار أ" />
                        </Form.Item>
                        <Form.Item
                          name="option1"
                          rules={[{ required: true, message: "يرجى إدخال الخيار ب" }]}
                          className="mb-2"
                        >
                          <Input size="large" placeholder="الخيار ب" />
                        </Form.Item>
                        <Form.Item
                          name="option2"
                          rules={[{ required: true, message: "يرجى إدخال الخيار ج" }]}
                          className="mb-2"
                        >
                          <Input size="large" placeholder="الخيار ج" />
                        </Form.Item>
                        <Form.Item
                          name="option3"
                          rules={[{ required: true, message: "يرجى إدخال الخيار د" }]}
                          className="mb-0"
                        >
                          <Input size="large" placeholder="الخيار د" />
                        </Form.Item>
                      </div>
                    </Form.Item>

                    <Form.Item
                      name="correctAnswer"
                      label="الإجابة الصحيحة"
                      rules={[{ required: true, message: "يرجى اختيار الإجابة الصحيحة" }]}
                    >
                      <Select size="large" placeholder="اختر الخيار الصحيح">
                        <Option value={0}>الخيار أ</Option>
                        <Option value={1}>الخيار ب</Option>
                        <Option value={2}>الخيار ج</Option>
                        <Option value={3}>الخيار د</Option>
                      </Select>
                    </Form.Item>
                  </>
                );
              }

              if (questionType === "true-false") {
                return (
                  <Form.Item
                    name="correctAnswer"
                    label="الإجابة الصحيحة"
                    rules={[{ required: true, message: "يرجى اختيار الإجابة الصحيحة" }]}
                  >
                    <Select size="large" placeholder="اختر الإجابة">
                      <Option value="صح">صح</Option>
                      <Option value="خطأ">خطأ</Option>
                    </Select>
                  </Form.Item>
                );
              }

              if (questionType === "short-answer") {
                return (
                  <Form.Item
                    name="correctAnswer"
                    label="الإجابة الصحيحة"
                    rules={[{ required: true, message: "يرجى إدخال الإجابة الصحيحة" }]}
                  >
                    <Input size="large" placeholder="أدخل الإجابة الصحيحة" />
                  </Form.Item>
                );
              }

              return null;
            }}
          </Form.Item>

          <Form.Item
            name="marks"
            label="الدرجات"
            rules={[
              { required: true, message: "يرجى إدخال الدرجات" },
              { type: "number", min: 1, message: "يجب أن تكون الدرجات 1 على الأقل" }
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              className="w-full"
              placeholder="أدخل عدد الدرجات"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-3 justify-end">
              <Button size="large" onClick={handleCloseModal}>
                إلغاء
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<Save className="w-4 h-4" />}
              >
                {editingQuestion ? "تحديث" : "إضافة السؤال"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>{" "}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {" "}
          <div className="card max-w-2xl w-full">
            {" "}
            <h2 className="text-2xl font-bold mb-4">
              {" "}
              استيراد الأسئلة من Excel{" "}
            </h2>{" "}
            <div className="space-y-4">
              {" "}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                {" "}
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {" "}
                  تنسيق ملف Excel:{" "}
                </h3>{" "}
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  {" "}
                  يجب أن يحتوي ملف Excel على الأعمدة التالية:{" "}
                </p>{" "}
                <div className="bg-white dark:bg-gray-800 rounded p-3 text-xs font-mono overflow-x-auto">
                  {" "}
                  <table className="w-full">
                    {" "}
                    <thead>
                      {" "}
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        {" "}
                        <th className="text-right p-1">Question</th>{" "}
                        <th className="text-right p-1">Choice A</th>{" "}
                        <th className="text-right p-1">Choice B</th>{" "}
                        <th className="text-right p-1">Choice C</th>{" "}
                        <th className="text-right p-1">Choice D</th>{" "}
                        <th className="text-right p-1">Correct Answer</th>{" "}
                      </tr>{" "}
                    </thead>{" "}
                    <tbody>
                      {" "}
                      <tr className="text-gray-600 dark:text-gray-400">
                        {" "}
                        <td className="p-1">السؤال هنا؟</td>{" "}
                        <td className="p-1">الخيار أ</td>{" "}
                        <td className="p-1">الخيار ب</td>{" "}
                        <td className="p-1">الخيار ج</td>{" "}
                        <td className="p-1">الخيار د</td>{" "}
                        <td className="p-1">A</td>{" "}
                      </tr>{" "}
                    </tbody>{" "}
                  </table>{" "}
                </div>{" "}
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                  {" "}
                  يجب أن يحتوي عمود "Correct Answer" على الحرف (A أو B أو C أو
                  D) للخيار الصحيح.{" "}
                </p>{" "}
              </div>{" "}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                {" "}
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />{" "}
                <label className="cursor-pointer">
                  {" "}
                  <span className="btn btn-primary"> اختر ملف Excel </span>{" "}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />{" "}
                </label>{" "}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {" "}
                  يدعم ملفات .xlsx و .xls و .csv{" "}
                </p>{" "}
              </div>{" "}
              <div className="flex gap-3 pt-4">
                {" "}
                <button
                  onClick={() => setShowImportModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  {" "}
                  إلغاء{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </DashboardLayout>
  );
}
