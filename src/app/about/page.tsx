"use client";

import type React from "react";

type FeatureProps = {
  emoji: string;
  title: string;
  description: string;
};

type TrackProps = {
  number: string;
  title: string;
  description: string;
};

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">PipelineDeployAI 🚀</h1>
        <p className="text-lg text-muted-foreground">
          AI-Driven Optimization for Telecom Network Deployment and Connectivity
          Enhancement in Catalonia
        </p>
      </div>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">📄 Overview</h2>
        <p className="text-muted-foreground mb-4">
          PipelineDeployAI leverages open-source data on existing and empty
          pipeline infrastructure (canalizations) in Catalonia. Our AI solution
          analyzes this data to find the most optimal way to connect and utilize
          these pipelines, significantly reducing costs and deployment time for
          next-generation telecom networks. Additionally, it provides insights
          on how to strategically increase connectivity in selected regions,
          ensuring targeted improvements in network coverage and performance.
        </p>
      </section>

      {/* Key Features */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">✨ Key Features</h2>
        <div className="space-y-6">
          <Feature
            emoji="🗺️"
            title="Infrastructure Mapping"
            description="Integrates open-source data on empty and deployed pipelines to create a comprehensive digital map of Catalonia's telecom infrastructure."
          />
          <Feature
            emoji="🧠"
            title="AI-Driven Optimization"
            description="Utilizes advanced algorithms to identify the most efficient ways to connect existing infrastructure, minimizing deployment costs and time."
          />
          <Feature
            emoji="📊"
            title="Deployment Simulation"
            description="Simulates various deployment scenarios to forecast costs, timelines, and potential challenges before physical implementation."
          />
          <Feature
            emoji="📡"
            title="Connectivity Analysis"
            description="Analyzes current network coverage and identifies optimal strategies to enhance connectivity in specific regions of Catalonia."
          />
          <Feature
            emoji="📋"
            title="Regulatory Compliance"
            description="Incorporates local regulations and permit requirements to ensure all proposed deployments are compliant and feasible."
          />
          <Feature
            emoji="💡"
            title="Decision Support"
            description="Provides actionable insights and recommendations to support strategic decision-making in network expansion and connectivity improvement projects."
          />
        </div>
      </section>

      {/* Business Impact */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">💼 Business Impact</h2>
        <div className="space-y-6">
          <Feature
            emoji="⏱️"
            title="Accelerated Deployment"
            description="Significantly reduce the time required to plan and implement new network infrastructure by optimizing the use of existing pipelines."
          />
          <Feature
            emoji="💰"
            title="Cost Reduction"
            description="Minimize capital expenditure by identifying the most cost-effective routes and leveraging existing infrastructure wherever possible."
          />
          <Feature
            emoji="🌐"
            title="Enhanced Coverage"
            description="Optimize network design to maximize coverage and performance in targeted regions, ensuring efficient use of resources and improved service delivery."
          />
          <Feature
            emoji="📈"
            title="Strategic Growth"
            description="Enable data-driven decisions for network expansion, focusing on areas with the highest potential for improved connectivity and return on investment."
          />
        </div>
      </section>

      {/* Hackathon Tracks */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">🏆 Hackathon Tracks</h2>
        <div className="space-y-6">
          <Track
            number="1"
            title="Data Integration & Visualization"
            description="Develop methods to effectively integrate and visualize diverse pipeline data sources for comprehensive infrastructure mapping and connectivity analysis."
          />
          <Track
            number="2"
            title="AI-Powered Route & Connectivity Optimization"
            description="Create algorithms that determine the most efficient ways to connect existing and new infrastructure, while identifying optimal strategies to enhance connectivity in specific regions."
          />
          <Track
            number="3"
            title="Deployment Simulation & Impact Forecasting"
            description="Build simulation tools that can accurately predict the outcomes of different deployment strategies, including costs, timelines, potential challenges, and improvements in regional connectivity."
          />
        </div>
      </section>
    </div>
  );
}

const Feature: React.FC<FeatureProps> = ({ emoji, title, description }) => {
  return (
    <div className="flex gap-4">
      <div className="text-2xl">{emoji}</div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
};

const Track: React.FC<TrackProps> = ({ number, title, description }) => {
  return (
    <div className="flex gap-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
};
