import Image from "next/image";
import Link from "next/link";
import { Sparkles, Image as ImageIcon, LayoutDashboard, Users, Wand2, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col text-black dark:text-white transition-colors duration-300 relative">
      <div className="fixed inset-0 -z-20">
        <Image
          src="/bg-2.png"
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-black/20 dark:bg-black/70 transition-colors"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-28">
        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55 dark:from-black/30 dark:via-black/50 dark:to-black/80"/>

        {/* CONTENT */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              Elevate Your
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f3d6cb] to-[#b38363]">
              Product Visuals With AI
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed text-zinc-200 drop-shadow-md">
            Generate stunning product photography,
            luxury backgrounds, creative advertising
            visuals, and model-based product images
            using advanced AI workflows built for
            modern e-commerce teams.
          </p>

          {/* BUTTONS */}
          <div className="m-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup"
              className="w-full sm:w-auto px-6 text-sm py-3 rounded-2xl bg-[#a06c45] text-white font-medium hover:bg-[var(--color-primary-brown)] transition-all
                duration-300 shadow-xl flex items-center justify-center gap-2 group">
                Start Creating
            </Link>

            <Link href="#features"
              className="w-full sm:w-auto text-sm px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-15 bg-white dark:bg-black/60 dark:backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6">
              Powerful Features for Modern Brands
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              Everything you need to produce professional-grade imagery without the cost of expensive photoshoots.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#faf7f5] dark:bg-[#1f1d1c] p-8 rounded-3xl border border-[#efe7e2] dark:border-white/5 shadow-sm
              hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center text-[var(--color-primary-pink)] mb-6">
                <ImageIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">AI Image Generation</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Transform basic product shots into stunning lifestyle imagery tailored for women's fashion and beauty.
              </p>
            </div>

            <div className="bg-[#faf7f5] dark:bg-[#1f1d1c] p-8 rounded-3xl border border-[#efe7e2] dark:border-white/5
              shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-[var(--color-primary-brown)] mb-6">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Role-Based Access</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                TaskHub divides users into Admins and Users, allowing seamless delegation and review of creative tasks.
              </p>
            </div>

            <div className="bg-[#faf7f5] dark:bg-[#1f1d1c] p-8 rounded-3xl border border-[#efe7e2] dark:border-white/5
              shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Intuitive Dashboard</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Manage all your product assets in one clean, modern interface designed for high productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-15 relative bg-white dark:bg-black/60 dark:backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6">
                How TaskHub Works
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-10">
                A streamlined workflow designed to get you from raw image to ready-to-publish asset in minutes.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary-pink)] text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-lg font-bold text-black dark:text-white mb-2">Upload Product</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Admins upload raw product images directly to the secure workspace.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary-brown)] text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-lg font-bold text-black dark:text-white mb-2">Select Theme or Background</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">User choose from curated themes tailored for women's e-commerce aesthetics.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-lg font-bold text-black dark:text-white mb-2">Generate & Approve</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Let the AI do the magic. Users generate options and submit to the admin. Admins review and approve.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative flex items-center justify-center">
              <div className="relative w-full max-w-2xl h-[420px] sm:h-[500px]">
                
                <div className="absolute left-0 top-10 w-[220px] sm:w-[280px] md:w-[320px] h-[300px] sm:h-[380px] rotate-[-8deg]
                  rounded-[45%] overflow-hidden border border-white/10 shadow-2xl">
                  <Image
                    src="/image-11.png"
                    alt="AI Product Generation"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-black/10"/>
                </div>

                <div
                  className="absolute right-0 bottom-0 w-[220px] sm:w-[280px] md:w-[320px] h-[300px] sm:h-[380px] rotate-[10deg] rounded-[42%] overflow-hidden border border-white/10 shadow-2xl">
                  <Image
                    src="/image-12.png"
                    alt="Luxury Product Visual"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"/>

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-black/10"/>
                </div>

                {/* BLUR BACKGROUND */}

                <div
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-200/20 to-orange-200/20 blur-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Uses Section */}
      <section id="uses" className="py-20 bg-white/60 dark:bg-black/60 backdrop-blur-md overflow-hidden transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADING */}

          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-4">
              AI Generated Product Backgrounds
            </h2>

            <p className="text-base text-zinc-600 dark:text-zinc-400">
              Create multiple professional product
              variations including white background,
              luxury themes, creative concepts,
              and model photography.
            </p>
          </div>

          {/* MOVING IMAGE TRAY */}

          <div className="relative">

            <div className="flex gap-6 w-max animate-scroll-left">
              {[
                {
                  image: "/image-8.png",
                  title: "White Background",
                },
                {
                  image: "/image-3.png",
                  title: "Luxury Velvet",
                },
                {
                  image: "/image-6.png",
                  title: "Marble Surface",
                },
                {
                  image: "/image-4.png",
                  title: "Creative",
                },
                {
                  image: "/image-5.png",
                  title: "Golden Studio",
                },
                {
                  image: "/image-9.png",
                  title: "Model Front View",
                },
                {
                  image: "/image-7.png",
                  title: "Side Angle Shoot",
                },
                {
                  image: "/image-10.png",
                  title: "Close-up Portrait",
                },

                // DUPLICATE FOR INFINITE LOOP

                {
                  image: "/image-8.png",
                  title: "White Background",
                },
                {
                  image: "/image-3.png",
                  title: "Luxury Velvet",
                },
                {
                  image: "/image-6.png",
                  title: "Marble Surface",
                },
                {
                  image: "/image-4.png",
                  title: "Creative",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative min-w-[180px] sm:min-w-[220px] md:min-w-[240px] h-[260px] sm:h-[320px] rounded-3xl
                    overflow-hidden group border border-white/10 shadow-xl"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>

                  {/* LABEL */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="inline-flex px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/10 text-white text-sm">
                      {item.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}