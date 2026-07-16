// Temporary QA route — visually diff against figma/*.png, then delete
// or dev-gate once confirmed. No data fetching, unrelated to /auth-test.

import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

const swatches = [
  { name: "white", className: "bg-white border border-border" },
  { name: "linen", className: "bg-linen" },
  { name: "stone", className: "bg-stone" },
  { name: "slate", className: "bg-slate" },
  { name: "black", className: "bg-black" },
  { name: "primary-pink", className: "bg-primary-pink" },
  { name: "secondary-pink", className: "bg-secondary-pink" },
  { name: "tertiary-pink", className: "bg-tertiary-pink" },
  { name: "blue-1", className: "bg-blue-1" },
  { name: "blue-2", className: "bg-blue-2" },
  { name: "blue-3", className: "bg-blue-3" },
  { name: "blue-4", className: "bg-blue-4" },
];

export default function DesignSystemTestPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 p-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Color</h2>
        <div className="grid grid-cols-4 gap-3">
          {swatches.map((s) => (
            <div key={s.name} className="flex flex-col gap-1">
              <div className={`h-16 rounded-lg ${s.className}`} />
              <span className="text-xs text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Typography</h2>
        <Typography variant="mega-title">
          You&apos;re <em className="italic underline">all set</em>.
        </Typography>
        <Typography variant="title">A little more about you.</Typography>
        <Typography variant="h1">Grey pashmina</Typography>
        <Typography variant="subtitle">
          Helps us tailor suggestions that actually fit.
        </Typography>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Button</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Continue</Button>
          <Button variant="secondary">Continue</Button>
          <Button variant="outline">Take a Photo</Button>
          <Button variant="brand">Upload Photo</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Now available · Free to start</Badge>
          <Badge>She / Her</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Input</h2>
        <Input placeholder="e.g. Gonjoi" className="max-w-xs" />
        <Input
          defaultValue="Grey pashmina"
          endIcon={<Pencil />}
          className="max-w-xs"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Avatar</h2>
        <div className="flex items-center gap-3">
          <Avatar size="xs">
            <AvatarImage src="" alt="" />
            <AvatarFallback>KJ</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarImage src="" alt="" />
            <AvatarFallback>KJ</AvatarFallback>
          </Avatar>
          <Avatar size="default">
            <AvatarImage src="" alt="" />
            <AvatarFallback>KJ</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarImage src="" alt="" />
            <AvatarFallback>KJ</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Card</h2>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography variant="title" as="span">
                Everything in one place.
              </Typography>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="subtitle">
              Upload once, we&apos;ll identify the pieces, organize them.
            </Typography>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
