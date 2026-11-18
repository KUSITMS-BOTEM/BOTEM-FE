import HomeContainer from "@/widgets/home/HomeContainer";

type HomePageProps = {
  searchParams: Promise<{ open?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { open } = await searchParams;

  return <HomeContainer autoOpenFunding={open === "funding"} />;
}
