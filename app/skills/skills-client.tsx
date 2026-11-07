"use client";
import { useLocale } from "../i18n/localize";
import type { BuilderResource } from "../lib/builder-core";

export function ResourceConditions({resource:r}:{resource:BuilderResource}){
  const {t}=useLocale();
  return <details className="builder-conditions"><summary>{t("来源、版本与使用条件")}</summary><dl><dt>{t("最近核对")}</dt><dd>{r.verified_at?.slice(0,10)||t("待核对")}</dd><dt>{t("固定版本")}</dt><dd>{r.pinned_commit?.slice(0,12)||t("未锁定")}</dd><dt>{t("许可范围")}</dt><dd>{r.license_scopes.length?r.license_scopes.map(s=><span key={s.covers+s.label}>{s.covers}: {s.label} · {s.verified?t("已观察"):t("待核对")}<br/></span>):r.license_observed||t("待核对")}</dd></dl><p>{t("来源核对不等于运行或教学效果验证。使用前按具体组件核对条件。")}</p><a href={r.source_url} target="_blank" rel="noreferrer">{t("打开原始来源")} ↗</a></details>;
}
