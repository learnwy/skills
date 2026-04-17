import type { Locale } from "../../lib/i18n";
import type { TranslateFn, ViewMeta, WorkspaceView } from "../types";

type AppHeaderProps = {
  activeView: WorkspaceView;
  activeViewMeta: Record<WorkspaceView, ViewMeta>;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  t: TranslateFn;
};

export function AppHeader({
  activeView,
  activeViewMeta,
  locale,
  onLocaleChange,
  t,
}: AppHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-copy">
        <p className="page-kicker">{activeViewMeta[activeView].eyebrow}</p>
        <h2>{activeViewMeta[activeView].label}</h2>
        <p>{activeViewMeta[activeView].description}</p>
      </div>

      <div className="page-tools">
        <label className="locale-picker">
          <span>{t("locale.label")}</span>
          <select
            onChange={(event) => onLocaleChange(event.target.value as Locale)}
            value={locale}
          >
            <option value="en">{t("locale.en")}</option>
            <option value="zh-CN">{t("locale.zh-CN")}</option>
          </select>
        </label>
      </div>
    </header>
  );
}
