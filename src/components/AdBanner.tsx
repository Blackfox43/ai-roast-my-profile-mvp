import { useEffect } from "react";

export function AdBanner() {
  useEffect(() => {
    // Push AdSense script to render ads
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log("AdSense not yet loaded");
    }
  }, []);

  return (
    <div className="my-6 w-full">
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
        } as React.CSSProperties}
        data-ad-client="ca-pub-2969119962603598"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
