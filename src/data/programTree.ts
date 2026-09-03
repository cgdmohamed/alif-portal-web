export type DeliveryChannel =
  | 'trainer_guide_only'
  | 'shared_live_screen'
  | 'student_synchronous'
  | 'student_async_homework'

export type ExecutionMode = 'فردي' | 'جماعي' | 'ثنائي'

export const activityTypes = [
  'اختيار متعدد',
  'صح أو خطأ',
  'لغز منطقي',
  'مقالي',
  'بحث عن كلمات',
  'مطابقة',
  'اختيار وترتيب',
  'تمثيل أدوار',
  'مناظرة',
  'حركة جسدية',
]

export const deliveryChannels: { value: DeliveryChannel; label: string; description: string }[] = [
  {
    value: 'trainer_guide_only',
    label: 'دليل المدرب فقط',
    description: 'يظهر فقط في لوحة المدرب كتعليمات تنفيذ، بدون تفاعل من الطالب',
  },
  {
    value: 'shared_live_screen',
    label: 'عرض على شاشة مشتركة',
    description: 'يعرضه المدرب على الشاشة أثناء اللقاء',
  },
  {
    value: 'student_synchronous',
    label: 'تفاعل متزامن للطالب',
    description: 'يفتح في تطبيق كل طالب فور إرساله من المدرب',
  },
  {
    value: 'student_async_homework',
    label: 'واجب لاحق',
    description: 'يظهر للطالب كواجب يحله بعد اللقاء',
  },
]
