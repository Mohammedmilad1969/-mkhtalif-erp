'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSystemHelpSearch } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, X, Send, ExternalLink, Bot, User as UserIcon } from 'lucide-react';

interface Message {
  role: 'bot' | 'user';
  text: string;
  links?: { label: string; href: string }[];
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

const RESPONSE_TEMPLATES: Record<string, (links: { label: string; href: string }[]) => string> = {
  default: (links) => {
    const pages = links.map((l) => l.label).join(', ');
    return `You can find this in the **${pages}** section. Navigate there from the sidebar.`;
  },
};

function buildBotResponse(query: string, results: any[]): { text: string; links: { label: string; href: string }[] } {
  const links = results.flatMap((r: any) =>
    (r.relatedPages || []).map((href: string) => ({ label: href.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), href }))
  ).filter((l: any, i: number, arr: any[]) => arr.findIndex((a: any) => a.href === l.href) === i);

  const q = query.toLowerCase();

  if (q.includes('lead') && (q.includes('creat') || q.includes('add') || q.includes('new'))) {
    return {
      text: `To create a new lead, go to **CRM Pipeline** in the sidebar and click the **"Add Lead"** button at the top-right. Fill in the client name, email, and phone — the more details you add, the better the AI scoring will work.`,
      links,
    };
  }

  if (q.includes('score') || q.includes('ai')) {
    return {
      text: `Open any lead from **CRM Pipeline**, then click the **"AI Score"** button on the lead detail page. The AI analyzes 8 factors like source quality, email type, and budget to give a score out of 10. You can also manually score a lead from the **Qualification** tab.`,
      links,
    };
  }

  if (q.includes('task') && (q.includes('chain') || q.includes('multi'))) {
    return {
      text: `Task chains let you create a sequence of tasks that appear one after another. Go to **Automation** in the sidebar, create a rule, and set the action type to **"Task Chain (Multi-step)"**. Add your steps with titles and optional checklists. Only Step 1 is created right away — the next step auto-creates when you mark the current one complete.`,
      links,
    };
  }

  if (q.includes('automation') || q.includes('rule')) {
    return {
      text: `Go to **Automation** in the sidebar and click **"Create Rule"**. Pick a trigger (like Lead Created) and add optional conditions (like score ≥ 8). Then choose an action — you can create a single task, a multi-step task chain, change the lead stage, assign the lead, or send a notification. You can also use one of the preset templates to get started quickly.`,
      links,
    };
  }

  if (q.includes('project')) {
    return {
      text: `Go to **Projects** in the sidebar under Operations. Click **"Create Project"** and link it to a client. Each project can have tasks, sprints, deliverables with file versioning, and time tracking against tasks.`,
      links,
    };
  }

  if (q.includes('calendar') || q.includes('meeting') || q.includes('event')) {
    return {
      text: `Open **Calendar** from the Communications section. You can view events by day, week, or month. Click any date to create a new event linked to a lead, client, or project. Events also show up on the lead's timeline.`,
      links,
    };
  }

  if (q.includes('notification') || q.includes('alert') || q.includes('bell')) {
    return {
      text: `You'll see a bell icon in the top bar when you have notifications. Click it to see recent alerts — task assignments, lead updates, and stage changes. View your full notification history from **Communications → Notifications** in the sidebar.`,
      links,
    };
  }

  if (q.includes('report') || q.includes('analytics') || q.includes('dashboard')) {
    return {
      text: `The **Dashboard** gives you a high-level overview with KPIs and charts. For deeper analysis, go to **Analytics** in the sidebar. You can generate custom reports from the **Reports** page.`,
      links,
    };
  }

  if (q.includes('contract') || q.includes('agreement') || q.includes('deal')) {
    return {
      text: `To create a new contract, go to **Contracts** under Operations in the sidebar, then click **"Create Contract"**. Set the contract type, fill in the parties, terms, start/end dates, and attach any files. You can also generate a contract directly from a lead by clicking **"Create Contract"** on the lead detail page. Once signed, the system automatically moves the lead to the **Won** stage.`,
      links,
    };
  }

  if (q.includes('client') || q.includes('customer')) {
    return {
      text: `Go to **Clients** in the sidebar under Sales. You'll see all your clients in a searchable table. Click any client to view their details, linked projects, and communication history.`,
      links,
    };
  }

  if (q.includes('knowledge') || q.includes('help') || q.includes('guide') || q.includes('documentation')) {
    return {
      text: `The **Knowledge Base** stores articles, guides, FAQs, and SOPs. Go to **Intelligence → Knowledge Base** in the sidebar. You can filter by type (Guide, FAQ, Checklist) or search across all articles.`,
      links,
    };
  }

  const topResult = results[0];
  if (topResult) {
    const preview = topResult.content.split('\n').slice(0, 3).join(' ').slice(0, 200);
    return {
      text: `${topResult.title}: ${preview}${topResult.content.length > 200 ? '...' : ''}`,
      links,
    };
  }

  return {
    text: results.length > 0
      ? `Here's what I found about "${query}":`
      : `I couldn't find anything about "${query}". Try different keywords or check the Knowledge Base.`,
    links,
  };
}

export default function HelpChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hi! I can help you learn how to use the system. Ask me anything about leads, tasks, automation, or any feature.' },
  ]);
  const [botReply, setBotReply] = useState<Message | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: results, isFetching } = useSystemHelpSearch(submittedQuery);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botReply, isFetching]);

  useEffect(() => {
    if (!isFetching && results && submittedQuery) {
      const reply = { role: 'bot' as const, ...buildBotResponse(submittedQuery, results) };
      setBotReply(reply);
      const prevQuery = submittedQuery;
      setTimeout(() => {
        setMessages((prev) => {
          if (prev.some((m) => m.text === reply.text && m.role === 'bot')) return prev;
          return [...prev, reply];
        });
        setBotReply(null);
        setSubmittedQuery('');
      }, 600);
    }
  }, [isFetching, results, submittedQuery]);

  const handleSend = () => {
    const q = query.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setSubmittedQuery(q);
    setBotReply(null);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const suggestions = [
    'How to create a lead?',
    'How does AI scoring work?',
    'How to use task chains?',
    'How to create an automation?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-10rem)] bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary/5 shrink-0">
            <Bot className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">System Help</p>
              <p className="text-[10px] text-muted-foreground">Ask me how to use the system</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'user' ? 'bg-primary' : 'bg-muted-foreground/20'
                  }`}>
                    {msg.role === 'user' ? (
                      <UserIcon className="h-3.5 w-3.5 text-primary-foreground" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {msg.links.map((link, li) => (
                          <button
                            key={li}
                            type="button"
                            onClick={() => navigateTo(link.href)}
                            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-2.5 py-1 flex items-center gap-1 transition-colors"
                          >
                            {link.label} <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(isFetching || botReply) && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[90%]">
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    {isFetching ? <TypingDots /> : (
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{botReply!.text}</p>
                        {botReply!.links && botReply!.links.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {botReply!.links.map((link, li) => (
                              <button
                                key={li}
                                type="button"
                                onClick={() => navigateTo(link.href)}
                                className="text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-2.5 py-1 flex items-center gap-1 transition-colors"
                              >
                                {link.label} <ExternalLink className="h-2.5 w-2.5" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isFetching && !botReply && submittedQuery && results && results.length === 0 && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[90%]">
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                    I couldn&apos;t find an answer for that. Try different keywords, or check the{' '}
                    <button type="button" onClick={() => navigateTo('/knowledge')} className="text-primary hover:underline">Knowledge Base</button>.
                  </div>
                </div>
              </div>
            )}

            {!submittedQuery && messages.length === 1 && (
              <div className="pt-2 pl-8">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="text-xs bg-muted hover:bg-muted/80 border rounded-full px-2.5 py-1 transition-colors"
                      onClick={() => {
                        setMessages((prev) => [...prev, { role: 'user', text: s }]);
                        setSubmittedQuery(s);
                        setBotReply(null);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-3 flex gap-2 shrink-0">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any feature..."
              className="h-9 text-sm"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={!query.trim() || isFetching}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={() => setOpen(!open)}>
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
