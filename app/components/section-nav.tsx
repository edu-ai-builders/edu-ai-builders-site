"use client";

import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; meta?: string };
export type NavGroup = { title: string; items: NavItem[] };

export default function SectionNav({ title, groups }: { title: string; groups: NavGroup[] }) {
  const pathname = usePathname();
  return <Localize>{(
    <nav className="ea-sidebar" aria-label={`${title}内的内容`}>
      <p className="ea-sidebar-title">{title}</p>
      {groups.map(group => (
        <div className="ea-sidebar-group" key={group.title}>
          <p className="ea-sidebar-group-title">{group.title}</p>
          <ul>
            {group.items.map(item => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    <span>{item.label}</span>
                    {item.meta && <small>{item.meta}</small>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  )}</Localize>;
}
