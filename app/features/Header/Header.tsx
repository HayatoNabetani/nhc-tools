import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header>
      <div className="py-2 lg:max-w-5xl lg:w-full mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <Link href="/">
              <Image src="/logo/tool.png" alt="logo" width={120} height={120} />
            </Link>
          </div>
          <div className="">
            <h1 className="font-bold text-2xl">NHC tools</h1>
            <p className="text-sm">俺俺Webツール</p>
          </div>
        </div>
        <div className="flex">
          <div>ここに検索</div>
          <div>ここになんか</div>
          <div>ここになんか</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
