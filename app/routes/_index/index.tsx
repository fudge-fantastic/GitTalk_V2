import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ensureLocalUser } from "~/models/user.server";
import NavBar from "./navbar";
import { FaArrowRightLong } from "react-icons/fa6";
import { FeatureCard } from "~/components/landing/feature-card";
import { CodeWindow } from "~/components/landing/code-window";
import { SectionHeading } from "~/components/landing/section-heading";
import { SectionDivider } from "~/components/landing/section-divider";
import { Bot, Github, Files, BrainCircuit, Workflow, ShieldCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Footer } from "~/components/landing/footer";

export const meta: MetaFunction = () => {
  return [
    { title: "GitTalk_V2" },
    { name: "description", content: "Welcome to Another Version of GitTalk!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Always ensure user exists then send them to dashboard directly (no auth UI)
  await ensureLocalUser();
  return redirect("/dashboard");
}

export default function Index() {
  return (
    <div className="relative min-h-screen flex flex-col dark:bg-zinc-950 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
  <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 dark:opacity-60 bg-[radial-gradient(circle_at_20%_25%,rgba(16,185,129,0.25),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(45,212,191,0.25),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.18),transparent_65%)]" />
      <NavBar />
      {/* Hero */}
      <section className="relative px-6 md:px-10 pt-36 md:pt-40 pb-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Chat with your <span className="relative inline-block"><span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Codebase</span></span>
            </h1>
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed mb-8">
              GitTalk lets you interrogate repositories, surface the right files instantly, and generate insights using modern LLMs (Gemini, OpenAI, Ollama). Vector search, smart chunking & caching keep everything fast and affordable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/dashboard" className="">Open Dashboard <FaArrowRightLong className="ml-1" /></Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1"><BrainCircuit className="size-3.5" /> Multi-model</div>
              <div className="flex items-center gap-1"><Github className="size-3.5" /> GitHub ingest</div>
              <div className="flex items-center gap-1"><Files className="size-3.5" /> Chunk + embed</div>
              <div className="flex items-center gap-1"><Workflow className="size-3.5" /> Graph orchestration</div>

            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-cyan-400/20 blur-2xl rounded-3xl -z-10" />
            <CodeWindow />
          </div>
        </div>
      </section>

    <SectionDivider label="Explore Features" />
    {/* Features */}
  <section className="px-6 md:px-10 py-14">
        <div className="max-w-7xl mx-auto">
          <SectionHeading className="mb-8">Why GitTalk?</SectionHeading>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Bot className="size-5" />} title="Conversational Code" description="Ask natural language questions across your repo & docs. Answers link to the exact lines." />
            <FeatureCard icon={<Github className="size-5" />} title="GitHub Aware" description="Ingest branches & commits fast. Keep context fresh with incremental updates." />
            <FeatureCard icon={<Files className="size-5" />} title="Smart Chunking" description="Adaptive splitting preserves semantics for better embeddings & retrieval." />
            <FeatureCard icon={<BrainCircuit className="size-5" />} title="Model Flexibility" description="Swap between Gemini, OpenAI, and local Ollama models per project." />
            <FeatureCard icon={<Workflow className="size-5" />} title="LangGraph Pipelines" description="Composable chains orchestrate retrieval, reasoning & tool use." />
            <FeatureCard icon={<ShieldCheck className="size-5" />} title="Caching & Control" description="Embedding + answer caching lowers latency and spend." />
          </div>
        </div>
      </section>

    <SectionDivider label="Workflow" />
    {/* How it works */}
  <section className="px-6 md:px-10 py-20">
        <div className="max-w-5xl mx-auto">
          <SectionHeading className="mb-10">How it works</SectionHeading>
          <ol className="grid md:grid-cols-3 gap-8 text-sm relative">
            <li className="space-y-3">
              <div className="font-semibold text-base flex items-center gap-2"><span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-medium">1</span> Connect Repo</div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-snug">Point to a GitHub repository. We fetch, dedupe & prepare the sources.</p>
            </li>
            <li className="space-y-3">
              <div className="font-semibold text-base flex items-center gap-2"><span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-medium">2</span> Index & Embed</div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-snug">Files are chunked, embedded & stored with caching to minimize repeated work.</p>
            </li>
            <li className="space-y-3">
              <div className="font-semibold text-base flex items-center gap-2"><span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-medium">3</span> Chat & Analyze</div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-snug">Ask questions, trace answers to source lines, export summaries & insights.</p>
            </li>
          </ol>
        </div>
      </section>

    <SectionDivider label="Get Started" />
    {/* Final CTA */}
  <section className="px-6 md:px-10 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Ready to build with your code intelligence copilot?</h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto">Spin up a project and start asking questions in under a minute. Your code deserves conversational understanding.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="shadow-md">
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
