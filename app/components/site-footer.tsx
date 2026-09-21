import Localize from "@/app/i18n/server-localize";
import Link from "next/link";

export default function SiteFooter() {
  return <Localize>{(
    <footer className="ea-footer">
      <div>
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <b>e</b>
          </span>
          <span>Edu AI Builders</span>
        </Link>
        <p>让教育想法成为可以学习、使用、构建和检验的作品。</p>
      </div>
      <nav aria-label="页脚导航">
        <Link href="/atlas">学习科学 Atlas</Link>
        <Link href="/learning-sciences">完整知识库</Link>
        <Link href="/changelog">更新日志</Link>
        <Link href="/updates/research">EduOS 与未来探索</Link>
        <a
          href="https://github.com/edu-ai-builders"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </nav>
      <div className="ea-footer-bottom">
        <span>EVERYONE CAN BE A BUILDER</span>
        <span>
          探索中的系统与可用资源分别标注。
          <a href="https://github.com/ywEdAi" target="_blank" rel="noreferrer">
            Yi Wang ↗
          </a>
        </span>
      </div>
    </footer>
  )}</Localize>;
}
