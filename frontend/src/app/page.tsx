"use client"

import React from 'react'
import Link from 'next/link'
import { 
  Compass, 
  MapPin, 
  Database, 
  Shield, 
  ArrowRight 
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const features = [
    {
      title: "Multi-Source Data Integration",
      description: "Combine satellite imagery, LIDAR, historical texts, and indigenous maps",
      icon: Database
    },
    {
      title: "AI-Powered Discovery",
      description: "Neural-inspired algorithms detect archaeological site patterns",
      icon: Compass
    },
    {
      title: "Ethical Research Approach",
      description: "Respect and collaborate with indigenous communities",
      icon: Shield
    }
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 text-emerald-800">
          Indigenous Knowledge Research Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover hidden archaeological sites in the Amazon rainforest using advanced AI and multi-source data analysis
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/agent">
            <Button size="lg" className="group">
              Start Discovery 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/documentation">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <feature.icon className="mr-3 text-emerald-600" size={24} />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Explore Archaeological Discoveries
        </h2>
        <div className="flex justify-center space-x-4">
          <Link href="/analysis">
            <Button variant="default" size="lg" className="group">
              View Site Analysis 
              <MapPin className="ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 