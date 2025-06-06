import UltimateArchaeologicalChat from "@/components/ui/ultimate-archaeological-chat"
import { ImageGenerationDemo } from "@/components/ui/ai-chat-image-generation"
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"

export function Demo() {
  return (
    <div className="flex w-screen overflow-x-hidden">
      <AnimatedAIChat />
    </div>
  );
}

export function EnhancedDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Enhanced AI Chat Components
          </h1>
          <p className="text-white/60 text-lg">
            Modern 21st century design with beautiful typography and animations
          </p>
        </div>
        
        <div className="grid gap-12">
          {/* Animated AI Chat */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              ✨ Animated AI Chat Interface
            </h2>
            <UltimateArchaeologicalChat />
          </section>
          
          {/* Image Generation Demo */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              🎨 Enhanced Text Response & Image Generation
            </h2>
            <ImageGenerationDemo />
          </section>
        </div>
      </div>
    </div>
  );
} 