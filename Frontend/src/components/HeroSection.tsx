"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Earth3D from "./Earth3D";
import { FaCamera, FaUpload, FaChrome, FaRecycle, FaLeaf, FaSeedling, FaTree } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import UnauthorizedDialog from "./UnauthorizedDialog";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useRouter } from "next/navigation";
import AnalysisResultModal from "./AnalysisResultModal";
import EcoLoader from "./EcoLoader";

interface AnalysisResult {
  imageUrl: string;
  s3Url: string;
  predictedClass: string;
  confidence: number;
  analysis: {
    resalable: {
      is_resalable: boolean;
      platforms: string[];
      condition: string;
      value: string;
      tips: string;
    };
    recyclable: {
      is_recyclable: boolean;
      centers: string[];
      material: string;
      process: string;
      impact: string;
    };
    reusable: {
      is_reusable: boolean;
      ways: string[];
      durability: string;
      benefits: string;
      tutorial: string;
    };
    biodegradable: boolean;
    time_to_degrade: string;
    description: string;
  };
}

// Product-specific analysis database
const productAnalysisDB: Record<string, any> = {
  'E-waste': {
    resalable: {
      is_resalable: true,
      platforms: ['OLX', 'Facebook Marketplace', 'Quickr'],
      condition: 'E-waste items like old phones, laptops, or tablets can be resold if functional. Test all components before listing.',
      value: 'Value ranges from ₹500-₹50,000+ depending on brand, model, age, and condition. Research current market prices.',
      tips: 'Clean devices thoroughly, include original accessories if available, mention any defects clearly, and provide detailed specifications.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['E-waste collection centers', 'Authorized e-waste recyclers', 'Electronics stores with take-back programs'],
      material: 'Electronic components containing metals, plastics, and hazardous materials',
      process: 'E-waste must be handled by certified recyclers. They extract valuable metals (gold, silver, copper) and safely dispose of toxic materials like lead and mercury.',
      impact: 'Recycling e-waste prevents toxic materials from contaminating soil and water, recovers valuable metals, and reduces mining needs.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Donate to schools or NGOs if functional', 'Extract working components for DIY projects', 'Repair and refurbish if possible', 'Use as spare parts'],
      durability: 'E-waste durability varies. Functional items can last years with proper care.',
      benefits: 'Extending e-waste life reduces manufacturing demand, saves resources, and prevents premature disposal.',
      tutorial: '1) Test functionality, 2) Clean thoroughly, 3) Remove personal data, 4) Donate or sell if working, 5) If broken, take to certified recycler.'
    },
    carbon_footprint: {
      production: 'E-waste production has high carbon footprint (50-200 kg CO2 per device) due to mining, manufacturing, and transportation.',
      usage: 'Minimal if device is functional and reused.',
      disposal: 'Proper e-waste recycling: 5-10 kg CO2. Landfill disposal: 20-30 kg CO2 due to methane from decomposition.',
      total_estimate: 'Estimated 60-240 kg CO2 equivalent per device over lifetime.',
      reduction_tips: ['Extend device lifespan through repairs', 'Buy refurbished electronics', 'Recycle through certified centers', 'Donate functional devices']
    },
    biodegradable: false,
    time_to_degrade: 'E-waste does not biodegrade. Components can persist in landfills for hundreds of years, releasing toxins.'
  },
  'automobile wastes': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Automobile waste (discarded tires, batteries, scrap metal) cannot be resold as it is classified as waste material. Only functional auto parts in good condition can be resold.',
      value: 'No resale value for waste. Scrap metal value: ₹30-50/kg at recycling centers. Focus on proper recycling instead.',
      tips: 'Do not attempt to resell automobile waste. Instead, take to authorized recycling centers. Some functional auto parts (if in good condition) can be sold separately, but waste materials must be recycled.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Automobile scrap yards', 'Tire recycling facilities', 'Battery recycling centers', 'Metal recycling plants'],
      material: 'Rubber, metal, plastic, and hazardous fluids from vehicles',
      process: 'Tires are shredded and processed into rubber crumb. Metal parts are melted and reformed. Batteries are broken down to recover lead and acid.',
      impact: 'Recycling auto waste reduces landfill burden, recovers valuable materials, and prevents soil contamination from oil and fluids.'
    },
    reusable: {
      is_reusable: false,
      ways: ['Not recommended for reuse due to safety concerns', 'Some parts may be salvageable by professionals', 'Contact auto repair shops for assessment'],
      durability: 'Auto waste has reached end-of-life and poses safety risks if reused.',
      benefits: 'Proper disposal ensures materials are recovered safely and prevents environmental contamination.',
      tutorial: '1) Separate different material types, 2) Drain fluids properly, 3) Take to specialized recycling facilities, 4) Never dump in landfills.'
    },
    carbon_footprint: {
      production: 'High carbon footprint: 200-500 kg CO2 per tire, 50-100 kg CO2 per battery.',
      usage: 'N/A - waste product.',
      disposal: 'Recycling: 10-20 kg CO2. Landfill: 30-50 kg CO2 due to slow decomposition and methane.',
      total_estimate: 'Estimated 250-600 kg CO2 equivalent per unit.',
      reduction_tips: ['Recycle through proper channels', 'Support tire retreading programs', 'Use recycled auto parts', 'Maintain vehicles to extend lifespan']
    },
    biodegradable: false,
    time_to_degrade: 'Rubber tires take 50-80 years, metal parts take centuries. Batteries never fully degrade and leak toxins.'
  },
  'plastic_bottles': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Plastic bottles are single-use items not suitable for resale.',
      value: 'No resale value. Focus on recycling instead.',
      tips: 'Clean and recycle plastic bottles. Many areas offer deposit return schemes for bottles.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Local recycling bins', 'Plastic recycling facilities', 'Bottle return centers', 'Municipal waste collection'],
      material: 'PET (Polyethylene Terephthalate) - recyclable plastic #1',
      process: 'Bottles are cleaned, shredded into flakes, melted, and reformed into new products like fibers, containers, or new bottles.',
      impact: 'Recycling plastic bottles saves 60-75% energy compared to new production, reduces oil consumption, and prevents ocean pollution.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Refill with water or other liquids', 'Use as planters for small plants', 'Create DIY storage containers', 'Make art or craft projects'],
      durability: 'PET bottles can be reused multiple times if cleaned properly, but avoid heating as they may leach chemicals.',
      benefits: 'Reusing bottles reduces waste, saves money, and extends product life before recycling.',
      tutorial: '1) Wash thoroughly with soap, 2) Rinse well, 3) Air dry completely, 4) Refill or repurpose, 5) Recycle when no longer usable.'
    },
    carbon_footprint: {
      production: 'PET bottle production: 0.1-0.2 kg CO2 per bottle (includes oil extraction, manufacturing, transportation).',
      usage: 'Minimal - single-use item.',
      disposal: 'Recycling: 0.05 kg CO2. Landfill: 0.15 kg CO2. Incineration: 0.3 kg CO2.',
      total_estimate: 'Estimated 0.15-0.5 kg CO2 equivalent per bottle.',
      reduction_tips: ['Use reusable water bottles', 'Recycle all plastic bottles', 'Support bottle deposit programs', 'Reduce single-use plastic consumption']
    },
    biodegradable: false,
    time_to_degrade: 'PET plastic bottles take 450-1000 years to degrade in landfills, breaking into microplastics that contaminate soil and water.'
  },
  'cardboard_boxes': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Cardboard boxes are packaging materials, not typically resold.',
      value: 'No resale value, but can be recycled for cash at some centers (₹5-10/kg).',
      tips: 'Flatten boxes and take to recycling centers. Some moving companies buy used boxes.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Paper recycling facilities', 'Local recycling bins', 'Scrap paper dealers', 'Municipal waste collection'],
      material: 'Corrugated cardboard made from recycled paper fibers',
      process: 'Cardboard is pulped, cleaned, and reformed into new cardboard or paper products. Can be recycled 5-7 times before fibers degrade.',
      impact: 'Recycling cardboard saves trees, reduces water usage by 50%, and cuts energy consumption by 25% compared to new production.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Reuse for storage and organization', 'Use for moving or shipping', 'Create DIY projects (furniture, organizers)', 'Compost if untreated'],
      durability: 'Cardboard boxes can be reused multiple times if kept dry and undamaged. Avoid moisture to prevent weakening.',
      benefits: 'Reusing boxes extends their life, reduces waste, saves money on new boxes, and delays recycling needs.',
      tutorial: '1) Keep boxes dry and clean, 2) Reinforce corners if needed, 3) Store flat to save space, 4) Reuse for same purpose or repurpose creatively.'
    },
    carbon_footprint: {
      production: 'Cardboard production: 0.5-1 kg CO2 per kg (includes logging, pulping, manufacturing).',
      usage: 'Minimal - packaging material.',
      disposal: 'Recycling: 0.2 kg CO2. Landfill: 0.8 kg CO2 (methane from decomposition). Composting: 0.1 kg CO2.',
      total_estimate: 'Estimated 0.7-1.8 kg CO2 equivalent per kg of cardboard.',
      reduction_tips: ['Reuse boxes multiple times', 'Recycle when no longer usable', 'Compost if untreated', 'Choose minimal packaging products']
    },
    biodegradable: true,
    time_to_degrade: 'Cardboard biodegrades in 2-3 months in compost, 3-6 months in landfills (slower due to lack of oxygen).'
  },
  'clothing': {
    resalable: {
      is_resalable: true,
      platforms: ['OLX', 'Facebook Marketplace', 'Vinted', 'Poshmark', 'Local thrift stores'],
      condition: 'Clothing in good condition can be resold. Check for stains, tears, and wear. Clean and iron before listing.',
      value: 'Value depends on brand, condition, and style: ₹200-₹5000+ for regular items, designer items can fetch much more.',
      tips: 'Take clear photos in good lighting, mention brand and size, describe condition honestly, and price competitively.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Textile recycling programs', 'Clothing donation centers with recycling', 'Fabric recycling facilities', 'H&M and other brand take-back programs'],
      material: 'Natural fibers (cotton, wool) or synthetic fibers (polyester, nylon)',
      process: 'Natural fibers are shredded and respun. Synthetic fibers are melted and reformed. Mixed fabrics are downcycled into insulation or rags.',
      impact: 'Recycling clothing reduces landfill waste, saves water (2700L per cotton shirt), and prevents microplastic pollution from synthetic fibers.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Donate to charities or shelters', 'Swap with friends or at clothing swaps', 'Repurpose into rags or cleaning cloths', 'Upcycle into new items'],
      durability: 'Clothing durability varies by material. Natural fibers last longer, synthetics may pill or fade faster.',
      benefits: 'Reusing clothing extends product life, reduces textile waste, saves resources, and helps those in need.',
      tutorial: '1) Wash and repair if needed, 2) Donate to local charities, 3) Organize clothing swaps, 4) Repurpose worn items into cleaning rags.'
    },
    carbon_footprint: {
      production: 'Clothing production: 10-30 kg CO2 per item (cotton: 15 kg, polyester: 25 kg, includes farming/manufacturing).',
      usage: 'Washing and drying: 0.5-1 kg CO2 per wash cycle.',
      disposal: 'Recycling: 1-2 kg CO2. Landfill: 5-10 kg CO2 (synthetics don\'t decompose).',
      total_estimate: 'Estimated 15-40 kg CO2 equivalent per clothing item over lifetime.',
      reduction_tips: ['Buy second-hand clothing', 'Wash clothes less frequently', 'Air dry instead of machine dry', 'Repair instead of replacing']
    },
    biodegradable: true,
    time_to_degrade: 'Natural fibers (cotton, wool): 1-5 years. Synthetic fibers (polyester, nylon): 20-200 years, never fully biodegrade.'
  },
  'food_and_organic_waste': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Food waste cannot be resold for safety and health reasons.',
      value: 'No resale value, but can be composted to create valuable fertilizer.',
      tips: 'Compost food waste instead of selling. Some communities have composting programs that accept organic waste.'
    },
    recyclable: {
      is_recyclable: false,
      centers: ['Composting facilities', 'Municipal organic waste collection', 'Community gardens', 'Home composting systems'],
      material: 'Organic matter including food scraps, vegetable peels, and plant materials',
      process: 'Organic waste decomposes through composting, creating nutrient-rich soil amendment. Anaerobic digestion can produce biogas.',
      impact: 'Composting organic waste reduces methane emissions from landfills, creates valuable fertilizer, and improves soil health.'
    },
    reusable: {
      is_reusable: false,
      ways: ['Not suitable for reuse as food', 'Can be used for composting', 'Some scraps can feed animals (if safe)', 'Create biogas through anaerobic digestion'],
      durability: 'Food waste decomposes quickly and cannot be reused as food.',
      benefits: 'Composting food waste returns nutrients to soil, reduces landfill methane, and creates valuable organic fertilizer.',
      tutorial: '1) Separate organic waste, 2) Start home compost pile or use municipal collection, 3) Add brown materials (leaves, paper), 4) Turn regularly, 5) Use finished compost in gardens.'
    },
    carbon_footprint: {
      production: 'Food production: 1-5 kg CO2 per kg (varies by food type, includes farming, processing, transportation).',
      usage: 'N/A - waste product.',
      disposal: 'Composting: 0.1-0.3 kg CO2 (reduces methane). Landfill: 2-4 kg CO2 (methane emissions).',
      total_estimate: 'Estimated 1-9 kg CO2 equivalent per kg of food waste.',
      reduction_tips: ['Reduce food waste through meal planning', 'Compost all organic waste', 'Support anaerobic digestion programs', 'Donate excess food before it spoils']
    },
    biodegradable: true,
    time_to_degrade: 'Food waste biodegrades in 2-6 weeks in compost, 1-2 months in landfills (slower due to lack of oxygen).'
  },
  'glass_containers': {
    resalable: {
      is_resalable: true,
      platforms: ['OLX', 'Facebook Marketplace', 'Local vintage stores', 'Antique shops'],
      condition: 'Glass containers in good condition can be resold, especially vintage or decorative items.',
      value: 'Value varies: regular jars (₹50-₹200), vintage containers (₹500-₹5000+), decorative items can be valuable.',
      tips: 'Clean thoroughly, check for chips or cracks, highlight unique features, and research vintage value if applicable.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Glass recycling facilities', 'Local recycling bins', 'Bottle banks', 'Municipal waste collection'],
      material: 'Glass (silica, soda ash, limestone) - infinitely recyclable',
      process: 'Glass is crushed, melted, and reformed into new glass products. Can be recycled infinitely without quality loss.',
      impact: 'Recycling glass saves 30% energy, reduces mining needs, and prevents glass from taking up landfill space for thousands of years.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Store food and liquids', 'Use as vases or decorative containers', 'Create DIY projects (candles, terrariums)', 'Use for canning and preserving'],
      durability: 'Glass containers are extremely durable and can be reused indefinitely if not broken.',
      benefits: 'Reusing glass extends product life, reduces waste, saves money, and delays recycling needs.',
      tutorial: '1) Wash thoroughly with soap, 2) Sterilize if used for food storage, 3) Check for cracks before reuse, 4) Store safely to prevent breakage.'
    },
    carbon_footprint: {
      production: 'Glass production: 0.5-1 kg CO2 per kg (includes mining, melting at high temperatures).',
      usage: 'Minimal - reusable container.',
      disposal: 'Recycling: 0.2 kg CO2. Landfill: 0.5 kg CO2 (glass doesn\'t decompose).',
      total_estimate: 'Estimated 0.7-1.5 kg CO2 equivalent per kg of glass.',
      reduction_tips: ['Reuse glass containers multiple times', 'Recycle when broken', 'Choose glass over plastic when possible', 'Support glass recycling programs']
    },
    biodegradable: false,
    time_to_degrade: 'Glass does not biodegrade and can persist in the environment for thousands of years, breaking into smaller pieces but never fully degrading.'
  },
  'metal_cans': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Metal cans are single-use packaging, not typically resold.',
      value: 'Scrap value: ₹20-₹40 per kg at metal recycling centers.',
      tips: 'Clean cans and take to metal recycling centers. Some areas pay for aluminum cans specifically.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Metal recycling facilities', 'Scrap metal dealers', 'Local recycling centers', 'Municipal waste collection'],
      material: 'Aluminum or steel - both highly recyclable',
      process: 'Cans are crushed, melted, and reformed into new metal products. Aluminum can be recycled infinitely, steel can be recycled multiple times.',
      impact: 'Recycling metal cans saves 95% energy for aluminum and 60% for steel compared to new production, reduces mining, and prevents landfill waste.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Use for storage of small items', 'Create DIY projects (planters, organizers)', 'Use as pencil holders', 'Repurpose for crafts'],
      durability: 'Metal cans are durable and can be reused for storage if cleaned properly. Avoid rust by keeping dry.',
      benefits: 'Reusing cans extends their life, reduces waste, and provides free storage containers.',
      tutorial: '1) Remove labels and clean thoroughly, 2) Remove sharp edges if needed, 3) Paint or decorate if desired, 4) Use for storage or crafts.'
    },
    carbon_footprint: {
      production: 'Aluminum can: 0.3-0.5 kg CO2. Steel can: 0.2-0.4 kg CO2 (includes mining, smelting, manufacturing).',
      usage: 'Minimal - single-use packaging.',
      disposal: 'Recycling: 0.05-0.1 kg CO2. Landfill: 0.2-0.3 kg CO2 (slow decomposition).',
      total_estimate: 'Estimated 0.25-0.8 kg CO2 equivalent per can.',
      reduction_tips: ['Recycle all metal cans', 'Reuse for storage or crafts', 'Support can deposit programs', 'Choose products with recyclable packaging']
    },
    biodegradable: false,
    time_to_degrade: 'Aluminum cans: 200-500 years. Steel cans: 50-100 years. Both eventually rust but don\'t fully biodegrade.'
  },
  'plastic_bags': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Plastic bags are single-use items, not suitable for resale.',
      value: 'No resale value. Some stores offer bag return programs.',
      tips: 'Return bags to stores with recycling programs. Many supermarkets accept plastic bag returns.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Store bag return programs', 'Specialized plastic bag recycling', 'Some municipal recycling programs', 'Plastic film recycling centers'],
      material: 'LDPE (Low-Density Polyethylene) - plastic #4',
      process: 'Plastic bags are collected, cleaned, melted, and reformed into new plastic products like composite lumber or new bags.',
      impact: 'Recycling plastic bags reduces landfill waste, prevents ocean pollution, and saves oil resources. However, many bags still end up in landfills.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Reuse for shopping multiple times', 'Use as trash can liners', 'Protect items during storage', 'Use for packing'],
      durability: 'Plastic bags can be reused 5-10 times if handled carefully, but are prone to tearing.',
      benefits: 'Reusing bags reduces waste, saves money on new bags, and extends product life before disposal.',
      tutorial: '1) Keep bags clean and dry, 2) Store in car or bag for shopping, 3) Reuse until torn, 4) Return to store recycling when no longer usable.'
    },
    carbon_footprint: {
      production: 'Plastic bag production: 0.01-0.02 kg CO2 per bag (includes oil extraction, manufacturing).',
      usage: 'Minimal - single-use item.',
      disposal: 'Recycling: 0.005 kg CO2. Landfill: 0.015 kg CO2. Incineration: 0.02 kg CO2.',
      total_estimate: 'Estimated 0.015-0.04 kg CO2 equivalent per bag.',
      reduction_tips: ['Use reusable bags instead', 'Reuse plastic bags multiple times', 'Recycle through store programs', 'Avoid single-use bags when possible']
    },
    biodegradable: false,
    time_to_degrade: 'Plastic bags take 10-1000 years to degrade, breaking into microplastics that contaminate soil and oceans.'
  },
  'battery waste': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Batteries are hazardous waste and cannot be resold.',
      value: 'No resale value. Must be disposed of through proper channels.',
      tips: 'Never dispose of batteries in regular trash. Take to battery recycling centers or electronic stores with collection programs.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Battery recycling centers', 'Electronic stores with take-back programs', 'Hazardous waste collection sites', 'Municipal e-waste programs'],
      material: 'Lead-acid, lithium-ion, nickel-cadmium, or alkaline batteries containing toxic metals',
      process: 'Batteries are broken down to recover valuable metals (lead, lithium, nickel, cadmium) and neutralize toxic acids. Materials are then reused in new batteries.',
      impact: 'Recycling batteries prevents toxic metals from contaminating soil and water, recovers valuable materials, and reduces mining needs.'
    },
    reusable: {
      is_reusable: false,
      ways: ['Not suitable for reuse - batteries are single-use', 'Rechargeable batteries can be recharged multiple times before disposal', 'Never attempt to repair damaged batteries'],
      durability: 'Batteries are designed for single use (disposable) or limited recharges (rechargeable).',
      benefits: 'Proper disposal ensures toxic materials are handled safely and valuable metals are recovered.',
      tutorial: '1) Remove batteries from devices, 2) Tape terminals to prevent short circuits, 3) Store in cool, dry place, 4) Take to certified battery recycler, 5) Never throw in regular trash.'
    },
    carbon_footprint: {
      production: 'Battery production: 50-150 kg CO2 per battery (includes mining, manufacturing, transportation).',
      usage: 'Minimal - energy storage device.',
      disposal: 'Recycling: 5-10 kg CO2. Landfill: 20-30 kg CO2 (toxic contamination).',
      total_estimate: 'Estimated 55-180 kg CO2 equivalent per battery.',
      reduction_tips: ['Use rechargeable batteries when possible', 'Recycle all batteries properly', 'Choose devices with built-in batteries', 'Support battery recycling programs']
    },
    biodegradable: false,
    time_to_degrade: 'Batteries do not biodegrade. They can leak toxic chemicals (lead, cadmium, mercury) that contaminate soil and water for decades.'
  },
  'paper_and_print': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Paper waste is not suitable for resale.',
      value: 'Recycling value: ₹5-₹15 per kg at paper recycling centers.',
      tips: 'Separate paper by type (newspaper, office paper, magazines) for better recycling value.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Paper recycling facilities', 'Local recycling bins', 'Scrap paper dealers', 'Municipal waste collection'],
      material: 'Paper made from wood pulp - recyclable 5-7 times',
      process: 'Paper is pulped, cleaned, de-inked, and reformed into new paper products. Each recycling cycle shortens fibers slightly.',
      impact: 'Recycling paper saves trees, reduces water usage by 50%, cuts energy by 40%, and prevents methane emissions from landfills.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Use blank sides for notes or printing', 'Create origami or craft projects', 'Use as packing material', 'Shred for pet bedding or compost'],
      durability: 'Paper can be reused for writing/printing on blank sides before recycling.',
      benefits: 'Reusing paper extends its life, reduces waste, saves money, and delays recycling needs.',
      tutorial: '1) Check for blank sides, 2) Use for notes or printing, 3) Store for reuse, 4) Recycle when both sides are used.'
    },
    carbon_footprint: {
      production: 'Paper production: 0.8-1.2 kg CO2 per kg (includes logging, pulping, manufacturing).',
      usage: 'Minimal - writing/printing material.',
      disposal: 'Recycling: 0.3 kg CO2. Landfill: 1 kg CO2 (methane from decomposition).',
      total_estimate: 'Estimated 1.1-2.2 kg CO2 equivalent per kg of paper.',
      reduction_tips: ['Use both sides of paper', 'Recycle all paper products', 'Choose recycled paper products', 'Go digital when possible']
    },
    biodegradable: true,
    time_to_degrade: 'Paper biodegrades in 2-6 months in compost, 2-5 months in landfills (slower due to lack of oxygen).'
  },
  'shoes': {
    resalable: {
      is_resalable: true,
      platforms: ['OLX', 'Facebook Marketplace', 'Vinted', 'Local thrift stores', 'Shoe resale platforms'],
      condition: 'Shoes in good condition can be resold. Clean thoroughly and check for wear on soles.',
      value: 'Value varies: regular shoes (₹500-₹3000), brand name (₹2000-₹10000+), designer shoes can be very valuable.',
      tips: 'Clean shoes thoroughly, take photos from multiple angles, mention size and brand, note any wear or damage honestly.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Shoe recycling programs (Nike, Adidas)', 'Textile recycling facilities', 'Specialized shoe recyclers', 'Some municipal programs'],
      material: 'Leather, rubber, foam, fabric, and synthetic materials',
      process: 'Shoes are separated by material type. Rubber is ground for playground surfaces, leather is processed, and fabrics are recycled like textiles.',
      impact: 'Recycling shoes reduces landfill waste, recovers materials, and creates new products like playground surfaces and athletic tracks.'
    },
    reusable: {
      is_reusable: true,
      ways: ['Donate to charities or shelters', 'Give to friends or family', 'Use for gardening or messy work', 'Repair if possible'],
      durability: 'Shoe durability depends on material and construction. Well-made shoes can last years with proper care.',
      benefits: 'Reusing shoes extends product life, reduces waste, helps those in need, and saves resources.',
      tutorial: '1) Clean shoes thoroughly, 2) Check condition and repair if needed, 3) Donate to local charities, 4) Recycle when no longer wearable.'
    },
    carbon_footprint: {
      production: 'Shoe production: 10-20 kg CO2 per pair (includes material extraction, manufacturing, transportation).',
      usage: 'Minimal - footwear.',
      disposal: 'Recycling: 1-2 kg CO2. Landfill: 5-10 kg CO2 (synthetics don\'t decompose).',
      total_estimate: 'Estimated 11-30 kg CO2 equivalent per pair of shoes.',
      reduction_tips: ['Buy quality shoes that last longer', 'Repair shoes instead of replacing', 'Donate wearable shoes', 'Recycle through specialized programs']
    },
    biodegradable: true,
    time_to_degrade: 'Natural materials (leather, cotton): 25-50 years. Synthetic materials (rubber, foam): 50-1000 years, never fully biodegrade.'
  },
  'plastic waste': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Plastic waste cannot be resold. It must be recycled or properly disposed of.',
      value: 'No resale value. Some recycling centers pay ₹10-30 per kg for clean plastic waste.',
      tips: 'Clean and sort plastic by type before recycling. Check local recycling guidelines for accepted plastic types.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Plastic recycling facilities', 'Local recycling bins', 'Municipal waste collection', 'Specialized plastic recyclers'],
      material: 'Various types of plastic (PET, HDPE, PVC, etc.) - check recycling codes',
      process: 'Plastic is sorted by type, cleaned, shredded, melted, and reformed into new products. Some plastics are downcycled into lower-grade products.',
      impact: 'Recycling plastic reduces oil consumption, prevents ocean pollution, and reduces landfill waste. However, not all plastics are easily recyclable.'
    },
    reusable: {
      is_reusable: false,
      ways: ['Most plastic waste is not suitable for reuse', 'Some containers can be cleaned and reused if food-safe', 'Repurpose for non-food storage only'],
      durability: 'Plastic waste has reached end-of-life and may leach chemicals if reused.',
      benefits: 'Proper recycling ensures plastic is processed safely and reduces environmental impact.',
      tutorial: '1) Clean and sort by type, 2) Check recycling codes, 3) Remove labels and caps, 4) Take to recycling facility, 5) Never dump in nature.'
    },
    carbon_footprint: {
      production: 'Plastic production: 2-5 kg CO2 per kg (includes oil extraction, refining, manufacturing).',
      usage: 'Minimal - waste product.',
      disposal: 'Recycling: 0.5-1 kg CO2. Landfill: 2-3 kg CO2. Incineration: 3-4 kg CO2.',
      total_estimate: 'Estimated 2.5-9 kg CO2 equivalent per kg of plastic waste.',
      reduction_tips: ['Reduce plastic consumption', 'Recycle all recyclable plastics', 'Avoid single-use plastics', 'Support plastic recycling programs']
    },
    biodegradable: false,
    time_to_degrade: 'Plastic waste takes 20-1000 years to degrade, breaking into microplastics that contaminate soil, water, and air.'
  },
  'metal waste': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Metal waste (scrap metal) cannot be resold as consumer items, but has scrap value at recycling centers.',
      value: 'Scrap metal value: ₹30-80 per kg depending on metal type (aluminum, steel, copper).',
      tips: 'Sort metals by type for better value. Clean metals fetch higher prices. Take to authorized scrap metal dealers or recycling centers.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Metal recycling facilities', 'Scrap metal dealers', 'Local recycling centers', 'Municipal waste collection'],
      material: 'Various metals: aluminum, steel, copper, brass, etc.',
      process: 'Metals are sorted, cleaned, melted, and reformed into new metal products. Can be recycled infinitely without quality loss.',
      impact: 'Recycling metal saves 60-95% energy compared to new production, reduces mining, and prevents landfill waste.'
    },
    reusable: {
      is_reusable: false,
      ways: ['Metal waste is not suitable for reuse', 'Some components may be salvageable by professionals', 'Contact metalworking shops for assessment'],
      durability: 'Metal waste has reached end-of-life and should be recycled.',
      benefits: 'Recycling metal recovers valuable materials and reduces environmental impact significantly.',
      tutorial: '1) Sort by metal type, 2) Remove non-metal attachments, 3) Clean if possible, 4) Take to scrap metal dealer or recycling center.'
    },
    carbon_footprint: {
      production: 'Metal production: 1-10 kg CO2 per kg (varies by metal type, includes mining, smelting).',
      usage: 'Minimal - waste product.',
      disposal: 'Recycling: 0.1-0.5 kg CO2. Landfill: 0.3-0.8 kg CO2 (slow decomposition).',
      total_estimate: 'Estimated 1.1-11 kg CO2 equivalent per kg of metal waste.',
      reduction_tips: ['Recycle all metal waste', 'Sort metals for better recycling', 'Support metal recycling programs', 'Choose products with recyclable metal']
    },
    biodegradable: false,
    time_to_degrade: 'Metals do not biodegrade. They rust and corrode over 50-500 years but never fully degrade, potentially leaching into soil and water.'
  },
  'glass waste': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Glass waste (broken glass, bottles) cannot be resold. Only intact, decorative glass items may have resale value.',
      value: 'No resale value for waste glass. Some recycling centers may pay small amounts for clean glass.',
      tips: 'Clean glass before recycling. Remove labels and caps. Separate by color if required by your recycling facility.'
    },
    recyclable: {
      is_recyclable: true,
      centers: ['Glass recycling facilities', 'Bottle banks', 'Local recycling bins', 'Municipal waste collection'],
      material: 'Glass (silica, soda ash, limestone) - infinitely recyclable',
      process: 'Glass is crushed, cleaned, melted, and reformed into new glass products. Can be recycled infinitely without quality loss.',
      impact: 'Recycling glass saves 30% energy, reduces mining needs, and prevents glass from taking up landfill space for thousands of years.'
    },
    reusable: {
      is_reusable: false,
      ways: ['Broken glass waste is not suitable for reuse', 'Intact containers can be cleaned and reused', 'Never reuse broken or chipped glass'],
      durability: 'Broken glass waste cannot be reused. Only intact containers are reusable.',
      benefits: 'Recycling glass recovers materials efficiently and reduces environmental impact.',
      tutorial: '1) Handle broken glass carefully, 2) Wrap in newspaper before disposal, 3) Take to glass recycling facility, 4) Never mix with regular trash.'
    },
    carbon_footprint: {
      production: 'Glass production: 0.5-1 kg CO2 per kg (includes mining, melting at high temperatures).',
      usage: 'Minimal - waste product.',
      disposal: 'Recycling: 0.2 kg CO2. Landfill: 0.5 kg CO2 (glass doesn\'t decompose).',
      total_estimate: 'Estimated 0.7-1.5 kg CO2 equivalent per kg of glass waste.',
      reduction_tips: ['Recycle all glass waste', 'Reuse intact containers', 'Support glass recycling programs', 'Choose glass over plastic when possible']
    },
    biodegradable: false,
    time_to_degrade: 'Glass does not biodegrade and can persist in the environment for thousands of years, breaking into smaller pieces but never fully degrading.'
  },
  'Organics': {
    resalable: {
      is_resalable: false,
      platforms: [],
      condition: 'Organic waste (food scraps, plant matter) cannot be resold for safety and health reasons.',
      value: 'No resale value, but composting creates valuable fertilizer worth using in gardens.',
      tips: 'Compost organic waste instead of selling. Home composting or municipal composting programs are the best options.'
    },
    recyclable: {
      is_recyclable: false,
      centers: ['Composting facilities', 'Municipal organic waste collection', 'Community gardens', 'Home composting systems'],
      material: 'Organic matter including food scraps, vegetable peels, yard waste, and plant materials',
      process: 'Organic waste decomposes through composting, creating nutrient-rich soil amendment. Anaerobic digestion can produce biogas.',
      impact: 'Composting organic waste reduces methane emissions from landfills, creates valuable fertilizer, and improves soil health.'
    },
    reusable: {
      is_reusable: false,
      ways: ['Not suitable for reuse as food', 'Can be composted to create fertilizer', 'Some scraps can feed animals (if safe)', 'Create biogas through anaerobic digestion'],
      durability: 'Organic waste decomposes quickly and cannot be reused.',
      benefits: 'Composting organic waste returns nutrients to soil, reduces landfill methane, and creates valuable organic fertilizer.',
      tutorial: '1) Separate organic waste, 2) Start home compost pile or use municipal collection, 3) Add brown materials (leaves, paper), 4) Turn regularly, 5) Use finished compost in gardens.'
    },
    carbon_footprint: {
      production: 'Organic waste production: 1-5 kg CO2 per kg (varies by food type, includes farming, processing, transportation).',
      usage: 'N/A - waste product.',
      disposal: 'Composting: 0.1-0.3 kg CO2 (reduces methane). Landfill: 2-4 kg CO2 (methane emissions).',
      total_estimate: 'Estimated 1-9 kg CO2 equivalent per kg of organic waste.',
      reduction_tips: ['Reduce food waste through meal planning', 'Compost all organic waste', 'Support anaerobic digestion programs', 'Donate excess food before it spoils']
    },
    biodegradable: true,
    time_to_degrade: 'Organic waste biodegrades in 2-6 weeks in compost, 1-2 months in landfills (slower due to lack of oxygen).'
  }
};

// Helper function to generate product-specific description
const generateDescription = (predictedClass: string, categories: string[], confidence: number, analysis: any) => {
  const normalizedClass = predictedClass.toLowerCase().trim();
  
  // Check if we have product-specific analysis
  if (productAnalysisDB[normalizedClass] || Object.keys(productAnalysisDB).some(key => normalizedClass.includes(key.toLowerCase()))) {
    const resaleInfo = analysis.resalable.is_resalable ? 'This item has resale potential.' : 'This item is not suitable for resale.';
    const recycleInfo = analysis.recyclable.is_recyclable ? 'It can be recycled through proper channels.' : 'Special disposal procedures may be required.';
    const reuseInfo = analysis.reusable.is_reusable ? 'It can be reused or repurposed.' : 'It has reached the end of its useful life.';
    const bioInfo = analysis.biodegradable ? 'It is biodegradable and will break down naturally.' : 'It does not biodegrade and requires proper disposal.';
    
    return `This item is classified as "${predictedClass}" with ${confidence.toFixed(1)}% confidence. ${resaleInfo} ${recycleInfo} ${reuseInfo} ${bioInfo} Make sustainable choices to reduce environmental impact.`;
  }
  
  // Generic description
  return `This item is classified as "${predictedClass}" with ${confidence.toFixed(1)}% confidence. ${categories.length > 0 ? `Sustainability options: ${categories.join(", ")}.` : ""} Make sustainable choices to reduce environmental impact.`;
};

// Helper function to generate smart analysis defaults
const generateSmartAnalysis = (predictedClass: string, categories: string[], confidence: number) => {
  const isRecyclable = categories.some((cat) => cat.includes("Recyclable"));
  const isReusable = categories.some((cat) => cat.includes("Reusable"));
  const isResalable = categories.some((cat) => cat.includes("Resellable"));
  const isBiodegradable = categories.some((cat) => cat.includes("Biodegradable"));

  // Check if we have product-specific analysis
  const normalizedClass = predictedClass.toLowerCase().trim();
  let productSpecific = null;
  
  // Try to find exact match or partial match (prioritize exact matches)
  // First try exact match
  if (productAnalysisDB[normalizedClass]) {
    productSpecific = productAnalysisDB[normalizedClass];
  } else {
    // Try partial matches (but avoid false positives)
    for (const [key, value] of Object.entries(productAnalysisDB)) {
      const keyLower = key.toLowerCase();
      // More strict matching - check if predicted class contains key or key contains predicted class
      if ((normalizedClass.includes(keyLower) && keyLower.length > 3) || 
          (keyLower.includes(normalizedClass) && normalizedClass.length > 3)) {
        productSpecific = value;
        break;
      }
    }
  }

  // If we have product-specific data, use it and add description; otherwise generate generic
  if (productSpecific) {
    return {
      ...productSpecific,
      description: generateDescription(predictedClass, categories, confidence, productSpecific)
    };
  }

  // Items that should NOT be suggested for resale (waste, garbage, etc.)
  const nonResalableClasses = [
    "waste", "garbage", "trash", "automobile wastes", "food_and_organic_waste",
    "plastic waste", "metal waste", "glass waste", "E-waste", "battery waste",
    "Organics", "food", "organic", "disposables", "styrofoam", "aerosol"
  ];
  
  // Only suggest resale if it's resellable AND not a waste/garbage item
  const shouldSuggestResale = isResalable && !nonResalableClasses.some(nonRes => 
    predictedClass.toLowerCase().includes(nonRes.toLowerCase())
  );

  return {
    resalable: {
      is_resalable: shouldSuggestResale,
      platforms: shouldSuggestResale ? ["OLX", "Facebook Marketplace", "Quickr"] : [],
      condition: shouldSuggestResale 
        ? "Check item condition before listing. Take clear photos from multiple angles." 
        : "This item is classified as waste and is not suitable for resale. Consider recycling or proper disposal instead.",
      value: shouldSuggestResale 
        ? "Value varies based on condition, age, and market demand. Research similar listings." 
        : "No resale value - this item should be disposed of through proper waste management channels.",
      tips: shouldSuggestResale 
        ? "Take clear photos, write detailed descriptions, set competitive prices, and respond quickly to inquiries." 
        : "Instead of reselling, focus on proper disposal. Check recycling options or contact local waste management services for guidance on handling this type of waste.",
    },
    recyclable: {
      is_recyclable: isRecyclable,
      centers: isRecyclable 
        ? ["Check local recycling centers in your area", "Contact municipal waste management", "Search for specialized recycling facilities for this material type"]
        : ["Contact local waste management authority", "Check if special disposal procedures are required", "Consult environmental services for proper handling"],
      material: predictedClass || "Unknown material",
      process: isRecyclable 
        ? "Follow local recycling guidelines. Clean and sort materials before recycling. Separate different material types if applicable."
        : "This material may require special disposal procedures. Contact your local waste management authority for specific guidelines on handling this type of waste.",
      impact: isRecyclable 
        ? "Recycling reduces waste in landfills, conserves natural resources, and reduces energy consumption. Proper recycling of this material can significantly reduce environmental impact."
        : "Improper disposal of this material can have negative environmental impacts. Always follow local waste management guidelines to minimize harm to the environment.",
    },
    reusable: {
      is_reusable: isReusable,
      ways: isReusable 
        ? [
          "Repurpose for different uses around the home",
          "Donate to local charities or community centers",
          "Use for creative DIY projects",
          "Share with neighbors or friends who might need it"
        ]
        : [
          "This item is not suitable for reuse due to its condition or material type",
          "Consider proper disposal or recycling instead",
          "If parts are salvageable, check if specific components can be extracted and reused",
          "Contact waste management services for guidance"
        ],
      durability: isReusable 
        ? "Durability depends on material composition and current condition. Inspect before reuse."
        : "This item has reached the end of its useful life and is not suitable for reuse. Proper disposal is recommended.",
      benefits: isReusable 
        ? "Reusing extends product life, reduces waste, saves money, and minimizes environmental impact."
        : "While this item cannot be reused, proper disposal ensures materials are handled responsibly, preventing environmental contamination and supporting waste management systems.",
      tutorial: isReusable 
        ? "Clean the item thoroughly, assess its condition, and find creative ways to repurpose it based on its material and shape."
        : "Since this item cannot be reused, focus on proper disposal: 1) Check local waste management guidelines, 2) Separate materials if possible, 3) Use designated disposal facilities, 4) Consider recycling if applicable.",
    },
    carbon_footprint: {
      production: "Carbon footprint from production varies by material type and manufacturing process. Synthetic materials typically have higher footprints.",
      usage: "Minimal carbon footprint during usage phase if item is properly maintained and reused.",
      disposal: isRecyclable ? "Lower carbon footprint if recycled properly. Higher if sent to landfill where it may produce methane." : "Higher carbon footprint if sent to landfill. Consider recycling or reuse options.",
      total_estimate: "Total carbon footprint depends on material, production method, usage duration, and disposal method. Estimated range: 5-50 kg CO2 equivalent.",
      reduction_tips: [
        isRecyclable ? "Recycle through proper channels to reduce disposal impact" : "Consider alternative disposal methods",
        isReusable ? "Extend product life through reuse to reduce production impact" : "Reduce consumption of similar items",
        "Support sustainable manufacturing practices",
        "Choose products with lower carbon footprints when possible",
        "Properly maintain items to extend their lifespan"
      ].filter(Boolean),
    },
    biodegradable: isBiodegradable,
    time_to_degrade: isBiodegradable ? "Degradation time varies by material: organic materials (weeks to months), paper (2-5 months), natural fibers (1-5 years). Synthetic materials may take decades or centuries." : "Not applicable - this item is not biodegradable.",
    description: generateDescription(predictedClass, categories, confidence, {
      resalable: { is_resalable: shouldSuggestResale },
      recyclable: { is_recyclable: isRecyclable },
      reusable: { is_reusable: isReusable },
      biodegradable: isBiodegradable
    }),
  };
};

const HeroSection = () => {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, remainingUploads, decrementUploads, canUpload } = useAuth();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (videoRef.current && showCamera) {
      const video = videoRef.current;
      const events = ["loadeddata", "loadedmetadata", "playing"];
      const handleVideoReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setIsCameraReady(true);
        }
      };

      const attemptPlay = async () => {
        try {
          await video.play();
        } catch (err) {
          console.error("Error playing video", err);
        }
      };

      const readyTimeout = setTimeout(() => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setIsCameraReady(true);
        }
      }, 3000);

      events.forEach((event) =>
        video.addEventListener(event, handleVideoReady)
      );
      attemptPlay();

      return () => {
        events.forEach((event) =>
          video.removeEventListener(event, handleVideoReady)
        );
        clearTimeout(readyTimeout);
      };
    } else {
      setIsCameraReady(false);
    }
  }, [showCamera, videoRef.current]);

  useEffect(() => {
    if (showCamera && isCameraInitializing) {
      const initializeCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
              await videoRef.current.play();
            } catch (e) {
              console.error("Error playing video:", e);
            }
          }
          setIsCameraInitializing(false);
        } catch (error) {
          alert("Unable to access camera. Please check permissions.");
          setShowCamera(false);
          setIsCameraInitializing(false);
        }
      };
      initializeCamera();
    }
  }, [showCamera, isCameraInitializing]);

  const captureImage = async () => {
    if (!canUpload() || !videoRef.current) {
      setShowUnauthorizedDialog(true);
      setShowCamera(false);
      stopCamera();
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    try {
      setIsProcessing(true);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => blob && resolve(blob), "image/jpeg");
      });

      // Show the loader
      setAnalysisResult({
        imageUrl: URL.createObjectURL(blob),
        s3Url: "",
        predictedClass: "",
        confidence: 0,
        analysis: {
          resalable: {
            is_resalable: false,
            platforms: [],
            condition: "",
            value: "",
            tips: "",
          },
          recyclable: {
            is_recyclable: false,
            centers: [],
            material: "",
            process: "",
            impact: "",
          },
          reusable: {
            is_reusable: false,
            ways: [],
            durability: "",
            benefits: "",
            tutorial: "",
          },
          biodegradable: false,
          time_to_degrade: "",
          description: "",
        },
      });

      // Send to Flask Server (ML Analysis) - Required
      const flaskFormData = new FormData();
      flaskFormData.append("file", blob, "captured.jpg");
      const flaskResponse = await fetch("http://127.0.0.1:5001/upload", {
        method: "POST",
        body: flaskFormData,
      });
      
      if (!flaskResponse.ok) {
        throw new Error("ML server error: " + flaskResponse.statusText);
      }
      
      const flaskData = await flaskResponse.json();

      // Try Go Server (S3 upload) - Optional
      let goData = { url: "" };
      try {
        const goFormData = new FormData();
        goFormData.append("image", blob, "captured.jpg");
        const goUploadResponse = await fetch("http://localhost:8080/upload", {
          method: "POST",
          body: goFormData,
        });
        if (goUploadResponse.ok) {
          goData = await goUploadResponse.json();
        }
      } catch (goError) {
        console.log("Go backend not available, continuing without it");
      }

      // Generate smart analysis defaults
      const smartAnalysis = generateSmartAnalysis(
        flaskData.predicted_class || "",
        flaskData.functional_categories || [],
        flaskData.confidence || 0
      );
      
      // Try Go Server (Advanced Analysis) - Optional
      let analysisData = {
        analysis: smartAnalysis,
      };
      
      try {
        const goAnalyzeForm = new FormData();
        goAnalyzeForm.append("image", blob);
        const goAnalyzeResponse = await fetch("http://localhost:8080/analyze", {
          method: "POST",
          body: goAnalyzeForm,
        });
        if (goAnalyzeResponse.ok) {
          analysisData = await goAnalyzeResponse.json();
        }
      } catch (goError) {
        console.log("Go backend analysis not available, using basic analysis");
      }

      setCapturedImage(URL.createObjectURL(blob));
      setShowCamera(false);
      stopCamera();
      decrementUploads();

      // Update analysis result with actual data
      const finalResult = {
        imageUrl: URL.createObjectURL(blob),
        s3Url: goData.url || URL.createObjectURL(blob),
        predictedClass: flaskData.predicted_class,
        confidence: flaskData.confidence,
        analysis: analysisData.analysis,
      };

      // Store the result in localStorage and redirect
      localStorage.setItem("analysisResult", JSON.stringify(finalResult));
      router.push("/result");
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Set loading state
      setIsProcessing(true);

      // Create a temporary analysis result to show the loader
      setAnalysisResult({
        imageUrl: URL.createObjectURL(file),
        s3Url: "",
        predictedClass: "",
        confidence: 0,
        analysis: {
          resalable: {
            is_resalable: false,
            platforms: [],
            condition: "",
            value: "",
            tips: "",
          },
          recyclable: {
            is_recyclable: false,
            centers: [],
            material: "",
            process: "",
            impact: "",
          },
          reusable: {
            is_reusable: false,
            ways: [],
            durability: "",
            benefits: "",
            tutorial: "",
          },
          biodegradable: false,
          time_to_degrade: "",
          description: "",
        },
      });

      // Send to Flask Server (ML Analysis) - Required
      const flaskFormData = new FormData();
      flaskFormData.append("file", file);
      const flaskResponse = await fetch("http://127.0.0.1:5001/upload", {
        method: "POST",
        body: flaskFormData,
      });
      
      if (!flaskResponse.ok) {
        throw new Error("ML server error: " + flaskResponse.statusText);
      }
      
      const flaskData = await flaskResponse.json();

      // Try Go Server (S3 upload) - Optional
      let goData = { url: "" };
      try {
        const goFormData = new FormData();
        goFormData.append("image", file);
        const goUploadResponse = await fetch("http://localhost:8080/upload", {
          method: "POST",
          body: goFormData,
        });
        if (goUploadResponse.ok) {
          goData = await goUploadResponse.json();
        }
      } catch (goError) {
        console.log("Go backend not available, continuing without it");
      }

      // Generate smart analysis defaults
      const smartAnalysis = generateSmartAnalysis(
        flaskData.predicted_class || "",
        flaskData.functional_categories || [],
        flaskData.confidence || 0
      );
      
      // Try Go Server (Advanced Analysis) - Optional
      let analysisData = {
        analysis: smartAnalysis,
      };
      
      try {
        const goAnalyzeForm = new FormData();
        goAnalyzeForm.append("image", file);
        const goAnalyzeResponse = await fetch("http://localhost:8080/analyze", {
          method: "POST",
          body: goAnalyzeForm,
        });
        if (goAnalyzeResponse.ok) {
          analysisData = await goAnalyzeResponse.json();
        }
      } catch (goError) {
        console.log("Go backend analysis not available, using basic analysis");
      }

      setCapturedImage(URL.createObjectURL(file));
      decrementUploads();

      // Update analysis result with actual data
      const finalResult = {
        imageUrl: URL.createObjectURL(file),
        s3Url: goData.url || URL.createObjectURL(file),
        predictedClass: flaskData.predicted_class,
        confidence: flaskData.confidence,
        analysis: analysisData.analysis,
      };

      // Store the result in localStorage and redirect
      localStorage.setItem("analysisResult", JSON.stringify(finalResult));
      router.push("/result");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage || !analysisResult) {
      alert("Please upload or capture an image first");
      return;
    }

    try {
      setIsProcessing(true);

      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Try Go Server for advanced analysis (optional)
      try {
        const goAnalyzeForm = new FormData();
        goAnalyzeForm.append("image", blob);
        const goAnalyzeResponse = await fetch("http://localhost:8080/analyze", {
          method: "POST",
          body: goAnalyzeForm,
        });
        
        if (goAnalyzeResponse.ok) {
          const analysisData = await goAnalyzeResponse.json();
          // Update only the analysis part while keeping other properties
          setAnalysisResult({
            ...analysisResult,
            analysis: analysisData.analysis,
          });
        } else {
          // If Go backend fails, just show existing analysis
          console.log("Go backend not available, showing existing analysis");
        }
      } catch (goError) {
        // If Go backend fails, just show existing analysis
        console.log("Go backend not available, showing existing analysis");
      }

      setShowAnalysisModal(true);
    } catch (error) {
      console.error("Analysis error:", error);
      // Even if there's an error, show the modal with existing data
      if (analysisResult) {
        setShowAnalysisModal(true);
      } else {
        alert("Failed to analyze image. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  };

  const handleScanImage = async () => {
    if (!canUpload()) {
      setShowUnauthorizedDialog(true);
      return;
    }
    setShowCamera(true);
    setIsCameraInitializing(true);
    setIsCameraReady(false);
  };

  const handleUploadImage = () => {
    if (!canUpload()) {
      setShowUnauthorizedDialog(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleChromeExtension = () => {
    router.push("/extension");
  };

  return (
    <div
      id="hero"
      className="relative h-screen w-full backdrop-blur-lg bg-gradient-to-br from-teal-900/40 via-cyan-900/70 via-emerald-900/50 to-teal-800/40 overflow-hidden pt-16"
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      {/* Floating eco particles - only render on client to avoid hydration issues */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => {
            // Use seeded random for consistent values
            const seed = i * 7;
            const seededRandom = (seed: number) => {
              const x = Math.sin(seed) * 10000;
              return x - Math.floor(x);
            };
            const randomX = seededRandom(seed) * 100;
            const randomY = seededRandom(seed + 1) * 100;
            const randomDelay = seededRandom(seed + 2) * 2;
            const randomDuration = 3 + seededRandom(seed + 3) * 2;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-teal-400/30 rounded-full"
                initial={{
                  x: `${randomX}%`,
                  y: `${randomY}%`,
                  opacity: 0,
                }}
                animate={{
                  y: [`${randomY}%`, `${randomY - 20}%`],
                  x: [`${randomX}%`, `${randomX + (seededRandom(seed + 4) - 0.5) * 10}%`],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: randomDuration,
                  repeat: Infinity,
                  delay: randomDelay,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      )}
      <div className="absolute mt-16 inset-0 z-0 opacity-60">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Earth3D scale={1.3} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            rotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full max-w-[640px] h-[480px] bg-gray-800 rounded-lg overflow-hidden">
            <video
              key="camera-video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="rounded-lg"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {(isCameraInitializing || !isCameraReady) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                <p className="text-white ml-4">
                  {isCameraInitializing
                    ? "Initializing camera..."
                    : "Preparing stream..."}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowCamera(false);
                stopCamera();
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={isCameraReady ? { scale: 1.05 } : {}}
              whileTap={isCameraReady ? { scale: 0.95 } : {}}
              onClick={captureImage}
              disabled={!isCameraReady}
              className={`px-6 py-3 text-white rounded-lg shadow-lg ${
                isCameraReady
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-gray-500 cursor-not-allowed"
              }`}
            >
              {isCameraReady ? "Capture" : "Waiting for camera..."}
            </motion.button>
          </div>
        </div>
      )}

      {capturedImage && !showCamera && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-[70vh] rounded-lg"
          />
          <div className="mt-4 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCapturedImage(null)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
            >
              Close
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg"
            >
              Analyze
            </motion.button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-2"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <motion.h1
              initial={{ opacity: 0, y: -50, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              transition={{
                duration: 1.2,
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.2,
              }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-12 relative z-10 tracking-tight"
              style={{
                fontFamily: "'Montserrat', 'Poppins', sans-serif",
                letterSpacing: "-0.02em",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="inline-block"
                style={{
                  fontFamily: "'Montserrat', 'Poppins', sans-serif",
                  letterSpacing: "-0.03em",
                }}
              >
                Welcome to{" "}
                <motion.span
                  initial={{ color: "#ffffff" }}
                  animate={{
                    color: ["#ffffff", "#14b8a6", "#ffffff"],
                    textShadow: [
                      "0 0 0px rgba(20, 184, 166, 0)",
                      "0 0 20px rgba(20, 184, 166, 0.8)",
                      "0 0 0px rgba(20, 184, 166, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="text-teal-200 font-black"
                >
                  EcoScan
                </motion.span>
                !
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 relative z-10"
            style={{
              textShadow: "2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.5)",
            }}
          >
            Smart Sustainability Analysis
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-xl text-white mb-8 max-w-2xl mx-auto relative z-10 font-medium"
            style={{
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            Transform your waste into opportunities with AI-powered insights for
            <motion.span 
              className="font-semibold text-teal-300 inline-flex items-center mx-1"
              whileHover={{ scale: 1.1 }}
            >
              <FaRecycle className="mr-1" />
              Recycling
            </motion.span>,{" "}
            <motion.span 
              className="font-semibold text-green-300 inline-flex items-center mx-1"
              whileHover={{ scale: 1.1 }}
            >
              <FaLeaf className="mr-1" />
              Reusing
            </motion.span> and{" "}
            <motion.span 
              className="font-semibold text-emerald-300 inline-flex items-center mx-1"
              whileHover={{ scale: 1.1 }}
            >
              <FaSeedling className="mr-1" />
              Reselling
            </motion.span>.
          </motion.p>

          {/* Sustainability Icons Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex items-center justify-center gap-6 md:gap-8 lg:gap-10 mb-8 w-full"
          >
            {[
              { icon: <FaRecycle />, label: "Recycle", color: "text-teal-400" },
              { icon: <FaLeaf />, label: "Reuse", color: "text-green-400" },
              { icon: <FaSeedling />, label: "Resell", color: "text-emerald-400" },
              { icon: <FaTree />, label: "Eco-Friendly", color: "text-lime-400" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className={`${item.color} flex flex-col items-center cursor-pointer flex-shrink-0`}
              >
                <div className="text-3xl mb-1 drop-shadow-lg">{item.icon}</div>
                <span className="text-xs text-white font-medium text-center" style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}>{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(20, 184, 166, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleScanImage}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <FaCamera className="text-xl relative z-10" />
              <span className="relative z-10 font-semibold">{showCamera ? "Capture Image" : "Scan Item"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(20, 184, 166, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUploadImage}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <FaUpload className="text-xl relative z-10" />
              <span className="relative z-10 font-semibold">Upload Image</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(20, 184, 166, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChromeExtension}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:from-cyan-600 hover:to-teal-700 shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <FaChrome className="text-xl relative z-10" />
              <span className="relative z-10 font-semibold">Extension</span>
            </motion.button>
          </div>

          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 }}
              className="glass-effect rounded-xl p-4 mt-3 text-white max-w-md shadow-2xl border border-white/30"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-2xl"
                >
                  <FaLeaf />
                </motion.div>
                <div>
                  <p className="text-sm md:text-base font-medium">
                    You have <span className="font-bold text-teal-300">{remainingUploads}</span> free image
                    operations remaining.
                  </p>
                  <p className="text-xs sm:text-sm text-white/80 mt-1">
                    Sign up for unlimited access 🌱
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
      <UnauthorizedDialog
        isOpen={showUnauthorizedDialog}
        onClose={() => setShowUnauthorizedDialog(false)}
        onLogin={() => {
          setShowUnauthorizedDialog(false);
          setShowLoginModal(true);
        }}
        onSignup={() => {
          setShowUnauthorizedDialog(false);
          setShowSignupModal(true);
        }}
      />

      {isProcessing && <EcoLoader message="Analyzing your item..." />}
    </div>
  );
};

export default HeroSection;
