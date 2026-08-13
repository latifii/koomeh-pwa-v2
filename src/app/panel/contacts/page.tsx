import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { ContactBook } from "./_components/contact-book";
export const metadata:Metadata={title:"دفترچه مخاطبان | پنل کومه"};
export default function ContactsPage(){return <div><PanelPageHeader title="دفترچه مخاطبان" description="اطلاعات تماس متقاضیان، مالکان و اعضای تیم را یکجا نگه دارید." action={<Button><Plus />مخاطب جدید</Button>} /><ContactBook /></div>}

