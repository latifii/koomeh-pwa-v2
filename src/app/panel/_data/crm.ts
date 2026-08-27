import { panelProperties, panelRequests } from "@/app/panel/_data/panel";

export type CrmPriority = "low" | "normal" | "high";
export type CrmTaskStatus = "todo" | "doing" | "done";
export interface CrmTask { id: string; title: string; description: string; dueAt: string; status: CrmTaskStatus; priority: CrmPriority; assignee: string; relatedTo: string; }
export const crmTasks: CrmTask[] = [
  { id:"t-201",title:"تماس با مالک فایل ۱۰۲۷۴۰",description:"هماهنگی زمان بازدید و دریافت تصویر سند.",dueAt:"امروز، ۱۶:۳۰",status:"todo",priority:"high",assignee:"حامد کریمی",relatedTo:"ملک l3" },
  { id:"t-202",title:"ارسال فایل برای خانم موسوی",description:"سه فایل منتخب سالاریه از طریق پیامک ارسال شود.",dueAt:"امروز، ۱۸:۰۰",status:"doing",priority:"normal",assignee:"حامد کریمی",relatedTo:"تقاضای ۱۰۴۷" },
  { id:"t-203",title:"پیگیری نتیجه بازدید",description:"نظر مشتری درباره فایل پردیسان ثبت شود.",dueAt:"فردا، ۱۰:۰۰",status:"todo",priority:"normal",assignee:"علی محمدی",relatedTo:"تقاضای ۱۰۴۸" },
  { id:"t-204",title:"تکمیل مدارک آگهی",description:"پایان‌کار و شناسه قبض از مالک دریافت شد.",dueAt:"دیروز",status:"done",priority:"low",assignee:"حامد کریمی",relatedTo:"ملک l1" },
];
export function getCrmTask(id:string){return crmTasks.find((item)=>item.id===id)??null}

export type ActivityKind="call"|"visit"|"message"|"note"|"status";
export interface CrmActivity { id:string; kind:ActivityKind; title:string; description:string; actor:string; time:string; subjectType:"property"|"request"; subject:string; }
export const crmActivities:CrmActivity[]=[
  {id:"a1",kind:"call",title:"تماس با مالک",description:"مالک با بازدید عصر سه‌شنبه موافقت کرد.",actor:"حامد کریمی",time:"امروز، ۱۱:۲۰",subjectType:"property",subject:"آپارتمان نوساز ۱۲۰ متری"},
  {id:"a2",kind:"visit",title:"بازدید حضوری",description:"مشتری نورگیری را پسندید اما درباره قیمت نیاز به مذاکره دارد.",actor:"علی محمدی",time:"دیروز، ۱۷:۳۰",subjectType:"request",subject:"تقاضای مهدی احمدی"},
  {id:"a3",kind:"message",title:"ارسال فایل متناسب",description:"چهار فایل از طریق پیامک برای متقاضی ارسال شد.",actor:"سیستم",time:"دیروز، ۱۲:۱۵",subjectType:"request",subject:"تقاضای زهرا موسوی"},
  {id:"a4",kind:"status",title:"تغییر وضعیت آگهی",description:"آگهی پس از تکمیل مدارک منتشر شد.",actor:"مدیر شعبه",time:"۳ روز پیش",subjectType:"property",subject:"ویلایی دوبلکس ۲۲۰ متری"},
  {id:"a5",kind:"note",title:"یادداشت مشاور",description:"پارکینگ مستقل برای مشتری الزامی است.",actor:"حامد کریمی",time:"۴ روز پیش",subjectType:"request",subject:"تقاضای سارا کریمی"},
];

export interface MatchItem { id:string; requestId:string; propertyId:string; score:number; reasons:string[]; status:"new"|"sent"|"visited"; }
export const crmMatches:MatchItem[]=panelRequests.slice(0,5).map((request,index)=>({id:`m-${index+1}`,requestId:request.id,propertyId:panelProperties[index].listing.id,score:94-index*5,reasons:[request.values.districts[0]||"قم","بودجه مناسب",`${request.values.areaMin} متر به بالا`],status:(index<2?"new":index<4?"sent":"visited")}));

export interface Conversation { id:string; name:string; context:string; lastMessage:string; time:string; unread:number; online:boolean; messages:{id:string;sender:"me"|"them";text:string;time:string}[]; }
export const crmConversations:Conversation[]=[
  {id:"c-1",name:"مهدی احمدی",context:"تقاضای خرید آپارتمان",lastMessage:"برای بازدید فردا ساعت ۵ مناسب است.",time:"۱۰:۴۵",unread:2,online:true,messages:[{id:"1",sender:"them",text:"سلام، فایل پردیسان هنوز موجود است؟",time:"۱۰:۳۲"},{id:"2",sender:"me",text:"سلام، بله موجود است. امکان بازدید فردا را دارید؟",time:"۱۰:۳۸"},{id:"3",sender:"them",text:"برای بازدید فردا ساعت ۵ مناسب است.",time:"۱۰:۴۵"}]},
  {id:"c-2",name:"زهرا موسوی",context:"تقاضای اجاره ویلایی",lastMessage:"لطفاً آدرس شعبه را ارسال کنید.",time:"دیروز",unread:0,online:false,messages:[{id:"1",sender:"me",text:"سه فایل مناسب برای شما پیدا شده است.",time:"دیروز، ۱۵:۱۰"},{id:"2",sender:"them",text:"لطفاً آدرس شعبه را ارسال کنید.",time:"دیروز، ۱۵:۲۲"}]},
  {id:"c-3",name:"مالک فایل ۱۰۲۷۴۰",context:"آپارتمان نوساز",lastMessage:"تصویر سند را امشب ارسال می‌کنم.",time:"دوشنبه",unread:0,online:false,messages:[{id:"1",sender:"them",text:"تصویر سند را امشب ارسال می‌کنم.",time:"دوشنبه، ۱۹:۴۰"}]},
];
export function getConversation(id:string){return crmConversations.find((item)=>item.id===id)??null}

export interface CrmContact { id:string;name:string;mobile:string;type:"customer"|"owner"|"agent";description:string;lastContact:string; }
export const crmContacts:CrmContact[]=[
  {id:"p1",name:"مهدی احمدی",mobile:"09122541234",type:"customer",description:"متقاضی خرید آپارتمان پردیسان",lastContact:"امروز"},
  {id:"p2",name:"زهرا موسوی",mobile:"09193564521",type:"customer",description:"متقاضی اجاره خانه ویلایی",lastContact:"دیروز"},
  {id:"p3",name:"رضا اکبری",mobile:"09121220011",type:"owner",description:"مالک دو فایل در سالاریه",lastContact:"۳ روز پیش"},
  {id:"p4",name:"علی محمدی",mobile:"09120001122",type:"agent",description:"کارشناس شعبه مرکزی",lastContact:"امروز"},
];

