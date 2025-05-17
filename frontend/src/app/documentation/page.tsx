"use client"

import React from 'react'
import { 
  Book, 
  Database, 
  Globe, 
  Layers, 
  MapPin, 
  Shield, 
  Target 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function DocumentationPage() {
  const documentationSections = [
    {
      title: "Platform Overview",
      icon: Globe,
      content: "The Indigenous Knowledge Research Platform (IKRP) is an advanced AI-driven system designed to discover and analyze archaeological sites in the Amazon rainforest, integrating multiple data sources and indigenous knowledge."
    },
    {
      title: "Data Collection Methodology",
      icon: Database,
      content: "IKRP employs a multi-source data collection approach, including satellite imagery, LIDAR scans, historical texts, and indigenous map annotations to provide comprehensive archaeological site analysis."
    },
    {
      title: "Neural-Inspired Analysis",
      icon: Target,
      content: "Our AI models use neural-inspired algorithms to detect subtle geographical and historical patterns, identifying potential archaeological sites with high confidence and minimal human intervention."
    },
    {
      title: "Ethical Considerations",
      icon: Shield,
      content: "We prioritize indigenous knowledge and cultural sensitivity, ensuring that our research respects and collaborates with local communities throughout the discovery and analysis process."
    }
  ]

  const technicalDetails = [
    {
      title: "Backend Architecture",
      description: "FastAPI-based microservice with asynchronous data processing",
      technologies: ["Python 3.10+", "FastAPI", "Async Processing"]
    },
    {
      title: "Frontend Framework",
      description: "React-based interactive web application",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"]
    },
    {
      title: "AI & Machine Learning",
      description: "Neural network models for pattern recognition",
      technologies: ["PyTorch", "OpenAI GPT Models", "Custom Neural Architectures"]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
          <Book className="mr-4 text-emerald-600" size={40} />
          IKRP Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the cutting-edge technology behind our Archaeological Discovery Platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Layers className="mr-2 text-emerald-600" /> Platform Insights</h2>
          <Accordion type="single" collapsible>
            {documentationSections.map((section, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-lg">
                  <div className="flex items-center">
                    <section.icon className="mr-3 text-emerald-600" />
                    {section.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 text-emerald-600" /> Technical Details</h2>
          {technicalDetails.map((detail, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {detail.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {detail.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {detail.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex} 
                      className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 