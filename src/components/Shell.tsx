"use client"

import React from "react"
import { ChevronRightIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { NavSection, NavNode } from "@/lib/nav"

const base = import.meta.env.BASE_URL.replace(/\/$/, "")

function treeContainsSlug(nodes: NavNode[], slug: string): boolean {
  return nodes.some(
    (n) => n.slug === slug || treeContainsSlug(n.children, slug)
  )
}

// ── Sub-level items ───────────────────────────────────────────────────────────

function SubItems({ nodes, currentSlug }: { nodes: NavNode[]; currentSlug: string }) {
  return nodes.map((node) => (
    <SidebarMenuSubItem key={node.slug ?? node.title}>
      {node.slug ? (
        <SidebarMenuSubButton asChild isActive={node.slug === currentSlug}>
          <a href={`${base}/${node.slug}`}>
            <span>{node.title}</span>
          </a>
        </SidebarMenuSubButton>
      ) : (
        <SidebarMenuSubButton className="pointer-events-none opacity-50">
          <span>{node.title}</span>
        </SidebarMenuSubButton>
      )}
      {node.children.length > 0 && (
        <SidebarMenuSub>
          <SubItems nodes={node.children} currentSlug={currentSlug} />
        </SidebarMenuSub>
      )}
    </SidebarMenuSubItem>
  ))
}

// ── Top-level items ───────────────────────────────────────────────────────────

function TopItems({ nodes, currentSlug }: { nodes: NavNode[]; currentSlug: string }) {
  return nodes.map((node) => {
    const isActive = node.slug === currentSlug
    const childActive = treeContainsSlug(node.children, currentSlug)

    if (node.children.length === 0) {
      return (
        <SidebarMenuItem key={node.slug ?? node.title}>
          {node.slug ? (
            <SidebarMenuButton asChild isActive={isActive}>
              <a href={`${base}/${node.slug}`}>
                <span>{node.title}</span>
              </a>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton className="pointer-events-none opacity-50">
              <span>{node.title}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      )
    }

    return (
      <Collapsible
        key={node.slug ?? node.title}
        asChild
        defaultOpen={isActive || childActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <span>{node.title}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SubItems nodes={node.children} currentSlug={currentSlug} />
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  })
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function PageSidebar({ nav, currentSlug }: { nav: NavSection[]; currentSlug: string }) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <a
          href={base || "/"}
          className="text-sm font-semibold text-sidebar-foreground hover:text-sidebar-foreground"
        >
          How to Science
        </a>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((section) => {
          const sectionActive = treeContainsSlug(section.nodes, currentSlug)
          const content = (
            <SidebarMenu>
              <TopItems nodes={section.nodes} currentSlug={currentSlug} />
            </SidebarMenu>
          )

          if (section.kind === "group") {
            return (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                {content}
              </SidebarGroup>
            )
          }

          return (
            <Collapsible
              key={section.title}
              defaultOpen={sectionActive}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center">
                    {section.title}
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  {content}
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

interface ShellProps {
  nav: NavSection[]
  currentSlug: string
  headerRight?: React.ReactNode
  children: React.ReactNode
}

export function Shell({ nav, currentSlug, headerRight, children }: ShellProps) {
  return (
    <SidebarProvider>
      <PageSidebar nav={nav} currentSlug={currentSlug} />
      <SidebarInset className="m-2 ml-0 rounded-xl shadow-sm">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-background px-4 rounded-t-xl">
          <SidebarTrigger />
          {headerRight && (
            <>
              <div className="flex-1" />
              {headerRight}
            </>
          )}
        </header>
        <div className="flex-1 overflow-hidden rounded-b-xl">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
