import Reveal from "./Reveal";

export default function SectionHead({
  kicker,
  title,
  desc,
}: {
  kicker: string;
  title: string;
  desc: string;
}) {
  return (
    <Reveal className="max-w-[680px] mb-[54px]">
      <span className="kicker">{kicker}</span>
      <h2 className="font-extrabold my-[14px] mt-4" style={{ fontSize: "clamp(30px,4vw,48px)" }}>
        {title}
      </h2>
      <p className="text-muted text-[17px]">{desc}</p>
    </Reveal>
  );
}
