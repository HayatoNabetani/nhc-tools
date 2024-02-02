"use client";

import { DefaultHeader } from "@/constants/Header";
import userState from "@/recoil/header/atom";
import Image from "next/image";
import Link from "next/link";
import { useRecoilState } from "recoil";

const Header = () => {
  const [headerObject, setHeaderObject] = useRecoilState(userState);
  return (
    <header>
      <div className="py-2 lg:max-w-5xl lg:w-full mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <Link href="/" onClick={() => setHeaderObject(DefaultHeader)}>
              <Image src="/logo/tool.png" alt="logo" width={120} height={120} />
            </Link>
          </div>
          <div className="">
            <h1 className="font-bold text-2xl">{headerObject?.title}</h1>
            <p className="text-sm">{headerObject?.content}</p>
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
