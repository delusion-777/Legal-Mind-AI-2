import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const templates = {
    contracts: [
      {
        id: "nda",
        name: "Non-Disclosure Agreement",
        description: "Standard NDA template for confidential information protection",
        category: "Contracts",
      },
      {
        id: "service-agreement",
        name: "Service Agreement",
        description: "Professional services contract template",
        category: "Contracts",
      },
    ],
    policies: [
      {
        id: "privacy-policy",
        name: "Privacy Policy",
        description: "GDPR-compliant privacy policy template",
        category: "Policies",
      },
      {
        id: "terms-of-service",
        name: "Terms of Service",
        description: "Website terms of service template",
        category: "Policies",
      },
    ],
    letters: [
      {
        id: "demand-letter",
        name: "Demand Letter",
        description: "Professional demand letter template",
        category: "Letters",
      },
    ],
  }

  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, customizations } = await request.json()

    // Template generation logic would go here
    // For now, return a sample template

    const generatedTemplate = `
LEGAL DOCUMENT TEMPLATE
======================

Template ID: ${templateId}
Generated: ${new Date().toLocaleDateString()}

[This would contain the actual template content based on the templateId and customizations]

Customizations Applied:
${JSON.stringify(customizations, null, 2)}

Note: This template should be reviewed and customized by legal professionals before use.
`

    return NextResponse.json({ template: generatedTemplate })
  } catch (error) {
    console.error("Template generation error:", error)
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 })
  }
}
