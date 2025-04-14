"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p>Test page for diagnosing issues</p>
      <div className="mt-4">
        <Button>Test Button</Button>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a test card to see if it works properly.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}