from models import db, AgentState, Project, Stakeholder, Risk
from services.project_context_service import ProjectContextService
from datetime import datetime
import requests
import os
import json
import re

class IntelligentAgent:
    """Redux-style intelligent agent with persistent state management"""

    def __init__(self, user_id):
        self.user_id = user_id
        self.state = AgentState.get_or_create_for_user(user_id)

    def process_message(self, message):
        """Main entry point - processes user message with full state context"""

        # Step 1: Load agent state (Redux pattern)
        current_state = self.state.get_state_snapshot()

        # Step 2: Analyze message for intent and context
        analysis = self._analyze_message_intent(message, current_state)

        # Step 3: Dispatch actions to update state (Redux pattern)
        self._dispatch_state_updates(message, analysis)

        # Step 4: Generate contextual response using enhanced state
        response = self._generate_contextual_response(message, analysis)

        # Step 5: Learn from interaction and update long-term memory
        self._learn_from_interaction(message, response, analysis)

        return response

    def _analyze_message_intent(self, message, current_state):
        """Analyze message with full agent context for intent"""

        api_key = os.getenv('OPENROUTER_API_KEY')

        analysis_prompt = f"""
Analyze this project management message with the user's full context:

USER MESSAGE: "{message}"

AGENT CONTEXT:
- Active Project: {current_state['active_context'].get('project', {}).get('name', 'None')}
- Recent Conversations: {len(current_state['working_memory'].get('conversation_history', []))}
- User Style: {current_state['long_term_memory']['user_preferences']['communication_style']}
- Known Project Types: {current_state['long_term_memory']['user_preferences']['project_types']}
- Successful Strategies: {len(current_state['long_term_memory']['learned_patterns']['successful_strategies'])}

Return JSON analysis:
{{
    "intent": "create_project|update_project|ask_question|request_analysis|make_decision|general_conversation",
    "confidence": 0.8,
    "entities": {{
        "project_name": "extracted name or null",
        "stakeholders": ["Maria Johnson", "James Smith"],
        "timeline": "24 weeks",
        "objectives": ["reduce time", "improve accuracy"],
        "risks": ["security concerns", "user adoption"],
        "actions": ["schedule meeting", "create plan"]
    }},
    "context_changes": {{
        "new_project": true/false,
        "project_update": true/false,
        "focus_shift": "stakeholders|risks|schedule|budget|null"
    }},
    "urgency": "low|medium|high",
    "next_actions": ["suggested next steps"],
    "agent_actions": ["SET_ACTIVE_PROJECT", "LEARN_USER_PREFERENCE", "ADD_PENDING_DECISION"]
}}
"""

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3.5-sonnet",
                    "messages": [
                        {"role": "system", "content": "You are an intelligent PM agent analyzer. Return only valid JSON."},
                        {"role": "user", "content": analysis_prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 800
                }
            )

            if response.status_code == 200:
                ai_response = response.json()['choices'][0]['message']['content']
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
        except Exception as e:
            print(f"Intent analysis error: {e}")

        # Fallback analysis
        return {
            "intent": "general_conversation",
            "confidence": 0.5,
            "entities": {"project_name": None, "stakeholders": [], "timeline": None, "objectives": [], "risks": [], "actions": []},
            "context_changes": {"new_project": False, "project_update": False, "focus_shift": None},
            "urgency": "medium",
            "next_actions": [],
            "agent_actions": []
        }

    def _dispatch_state_updates(self, message, analysis):
        """Redux-style state updates based on analysis"""

        # Always add conversation to working memory
        self.state.dispatch_action("ADD_CONVERSATION", {
            "message": message,
            "analysis": analysis,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Process agent actions from AI analysis
        for action in analysis.get("agent_actions", []):
            if action == "SET_ACTIVE_PROJECT" and analysis["entities"]["project_name"]:
                # Create or find project
                project = self._create_or_find_project(analysis)
                if project:
                    self.state.dispatch_action("SET_ACTIVE_PROJECT", {
                        "project_id": project.id,
                        "project_data": project.to_dict()
                    })

            elif action == "LEARN_USER_PREFERENCE":
                # Learn communication style
                style = "concise" if len(message.split()) < 10 else "detailed"
                self.state.dispatch_action("LEARN_USER_PREFERENCE", {
                    "type": "communication_style",
                    "value": style
                })

            elif action == "ADD_PENDING_DECISION":
                for next_action in analysis["next_actions"]:
                    if "decide" in next_action.lower() or "choose" in next_action.lower():
                        self.state.dispatch_action("ADD_PENDING_DECISION", {
                            "decision": next_action,
                            "context": analysis["intent"],
                            "urgency": analysis["urgency"]
                        })

        # Update active context based on focus shift
        if analysis["context_changes"]["focus_shift"]:
            self.state.dispatch_action("UPDATE_PROJECT_CONTEXT", {
                "current_focus": analysis["context_changes"]["focus_shift"],
                "last_discussion": message[:100],
                "focus_updated": datetime.utcnow().isoformat()
            })

    def _create_or_find_project(self, analysis):
        """Create or find project based on AI analysis"""

        if not analysis["entities"]["project_name"]:
            return None

        # Use existing service but with AI-enhanced data
        extracted_info = {
            "project_names": [analysis["entities"]["project_name"]],
            "organizations": [],
            "timeline": analysis["entities"]["timeline"],
            "stakeholders": [{"name": name, "role": None} for name in analysis["entities"]["stakeholders"]]
        }

        return ProjectContextService.find_or_create_project(self.user_id, extracted_info)

    def _generate_contextual_response(self, message, analysis):
        """Generate AI response using full agent state context"""

        current_state = self.state.get_state_snapshot()

        # Build comprehensive context prompt
        context_prompt = self._build_enhanced_context_prompt(current_state, analysis, message)

        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3.5-sonnet",
                    "messages": [
                        {"role": "system", "content": context_prompt},
                        {"role": "user", "content": message}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1200
                }
            )

            if response.status_code == 200:
                ai_response = response.json()['choices'][0]['message']['content']
                return {
                    "content": ai_response,
                    "context_aware": True,
                    "state_version": current_state["metadata"]["version"],
                    "agent_analysis": analysis
                }
        except Exception as e:
            print(f"Response generation error: {e}")

        return {
            "content": "I'm processing your request with full context awareness. How can I help with your project management needs?",
            "context_aware": False,
            "state_version": current_state["metadata"]["version"]
        }

    def _build_enhanced_context_prompt(self, state, analysis, message):
        """Build comprehensive context prompt from agent state"""

        base_prompt = """You are an intelligent PM mentor with persistent memory and contextual awareness.

COMMUNICATION STYLE: Match the user's communication density. If they send short, concise messages, 
respond concisely (2-4 sentences). If they provide detailed input, provide detailed guidance. 
Always be direct and avoid unnecessary verbosity.

🧠 AGENT STATE CONTEXT:
"""

        # Add active project context
        active_project = state["active_context"].get("project")
        if active_project:
            base_prompt += f"""
📊 ACTIVE PROJECT: {active_project['name']}
Description: {active_project.get('description', 'N/A')}
Owner: User {active_project.get('owner_id')}
Due Date: {active_project.get('due_date', 'Not set')}
Current Focus: {state['active_context'].get('current_focus', 'General management')}
"""

        # Add user preferences and patterns
        prefs = state["long_term_memory"]["user_preferences"]
        base_prompt += f"""
👤 USER PROFILE:
Communication Style: {prefs['communication_style']}
Decision Making: {prefs['decision_making_pattern']}
Project Experience: {', '.join(prefs['project_types']) if prefs['project_types'] else 'Learning...'}
Conversation Count: {len(state['working_memory']['conversation_history'])}
"""

        # Add recent conversation context
        recent_conversations = state["working_memory"]["conversation_history"][-3:]
        if recent_conversations:
            base_prompt += "\n💬 RECENT CONTEXT:\n"
            for conv in recent_conversations:
                base_prompt += f"- {conv.get('message', '')[:100]}...\n"

        # Add pending decisions
        pending = state["working_memory"]["pending_decisions"]
        if pending:
            base_prompt += "\n⚠️ PENDING DECISIONS:\n"
            for decision in pending[-3:]:
                base_prompt += f"- {decision['decision']} (Urgency: {decision['urgency']})\n"

        # Add learned patterns
        patterns = state["long_term_memory"]["learned_patterns"]["successful_strategies"][-3:]
        if patterns:
            base_prompt += "\n✅ PROVEN STRATEGIES:\n"
            for pattern in patterns:
                base_prompt += f"- {pattern['strategy']}\n"

        # Add current message analysis
        base_prompt += f"""

🎯 CURRENT MESSAGE ANALYSIS:
Intent: {analysis['intent']} (Confidence: {analysis['confidence']})
Urgency: {analysis['urgency']}
Focus Area: {analysis['context_changes'].get('focus_shift', 'General')}
Entities Detected: {len(analysis['entities']['stakeholders'])} stakeholders, {len(analysis['entities']['risks'])} risks

INSTRUCTIONS:
- Use your persistent memory to provide contextual responses
- Reference previous conversations when relevant
- Be proactive with suggestions based on learned patterns
- Adapt your communication style to match user preferences
- Focus on {analysis['context_changes'].get('focus_shift', 'general project management')}
"""

        return base_prompt

    def _learn_from_interaction(self, message, response, analysis):
        """Learn and update long-term memory from interaction"""

        # Record successful strategies if positive outcome
        if analysis["confidence"] > 0.7 and analysis["intent"] in ["create_project", "update_project"]:
            strategy = f"Handled {analysis['intent']} with {analysis['confidence']} confidence"
            self.state.dispatch_action("RECORD_SUCCESS_PATTERN", {
                "strategy": strategy,
                "context": analysis["intent"],
                "outcome": "successful_interaction",
                "entities": analysis["entities"]
            })

        # Learn project types
        if analysis["entities"]["project_name"]:
            # Classify project type based on keywords
            project_type = "general"
            if any(keyword in message.lower() for keyword in ["software", "system", "application"]):
                project_type = "software_development"
            elif any(keyword in message.lower() for keyword in ["infrastructure", "network", "server"]):
                project_type = "infrastructure"
            elif any(keyword in message.lower() for keyword in ["integration", "migration", "upgrade"]):
                project_type = "system_integration"
            
            current_types = self.state.long_term_memory["user_preferences"]["project_types"]
            if project_type not in current_types:
                current_types.append(project_type)
                self.state.dispatch_action("LEARN_USER_PREFERENCE", {
                    "type": "project_types",
                    "value": current_types
                })

        # Update conversation history with response
        self.state.dispatch_action("ADD_CONVERSATION", {
            "message": message,
            "response": response["content"][:200] + "..." if len(response["content"]) > 200 else response["content"],
            "analysis_confidence": analysis["confidence"]
        })

    def get_agent_insights(self):
        """Get insights about agent's current state and capabilities"""
        state = self.state.get_state_snapshot()

        return {
            "agent_status": "intelligent_active",
            "state_version": state["metadata"]["version"],
            "active_project_id": state["working_memory"]["current_project_id"],
            "conversation_count": len(state["working_memory"]["conversation_history"]),
            "learned_patterns": len(state["long_term_memory"]["learned_patterns"]["successful_strategies"]),
            "pending_decisions": len(state["working_memory"]["pending_decisions"]),
            "user_preferences": state["long_term_memory"]["user_preferences"],
            "memory_types": {
                "working_memory": len(str(state["working_memory"])),
                "long_term_memory": len(str(state["long_term_memory"])),
                "active_context": len(str(state["active_context"]))
            }
        }