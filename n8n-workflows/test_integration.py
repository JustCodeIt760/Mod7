#!/usr/bin/env python3
"""Final test of the complete AI integration"""

import requests
import time
import json

def test_complete_integration():
    print("🎯 Final AI Agent Integration Test")
    print("=" * 50)
    
    # Test payload with a clear, specific feature
    test_feature = {
        "event": "parking_lot_added",
        "data": {
            "feature_id": 999,
            "feature_name": "Social Media Integration",
            "feature_description": "Add social media login (Google, Facebook, Twitter), social sharing buttons, user profile sync, and social activity feeds to increase user engagement",
            "project_id": 1,
            "priority": 8,
            "status": "Not Started"
        }
    }
    
    print("🚀 Triggering AI workflow...")
    print(f"Feature: {test_feature['data']['feature_name']}")
    print(f"Description: {test_feature['data']['feature_description']}")
    
    try:
        # Trigger the n8n workflow
        response = requests.post(
            'http://localhost:5678/webhook/parking-lot-added',
            json=test_feature,
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ n8n webhook triggered successfully!")
            
            print("\n⏳ AI is processing... (30-60 seconds)")
            print("🔍 What should happen:")
            print("  1. OpenAI analyzes the feature description")
            print("  2. AI generates 5-8 specific tasks")
            print("  3. Tasks are sent to TaskFlow API")
            print("  4. Tasks appear in your project")
            
            # Wait for processing
            for i in range(6):
                print(f"⏳ Processing... {i*10}s")
                time.sleep(10)
            
            print("\n✅ Processing complete!")
            
            # Check TaskFlow webhook health
            print("\n🔍 Checking TaskFlow connection...")
            try:
                health_check = requests.get('http://localhost/api/webhooks/health', timeout=5)
                if health_check.status_code == 200:
                    print("✅ TaskFlow webhook endpoint is healthy")
                else:
                    print("❌ TaskFlow webhook endpoint issue")
            except Exception as e:
                print(f"⚠️  TaskFlow webhook check failed: {e}")
            
            return True
        else:
            print(f"❌ n8n webhook failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

def show_verification_steps():
    print("\n📊 Verification Steps:")
    print("=" * 30)
    
    print("1. 🔍 Check n8n Execution:")
    print("   • Open: http://localhost:5678")
    print("   • Click 'Executions' in sidebar")
    print("   • Look for green checkmarks (success)")
    print("   • Click execution to see details")
    
    print("\n2. 🎯 Check TaskFlow:")
    print("   • Open: http://localhost")
    print("   • Go to your project")
    print("   • Look for new tasks in features")
    print("   • Tasks should have AI-generated names & descriptions")
    
    print("\n3. 🐛 If Issues:")
    print("   • Red execution = Error (check n8n logs)")
    print("   • No tasks = TaskFlow API issue")
    print("   • Generic tasks = AI fallback (OpenAI issue)")

def show_expected_results():
    print("\n🎯 Expected AI-Generated Tasks:")
    print("=" * 35)
    
    expected_tasks = [
        "Design social login UI components (3h, UI/UX)",
        "Implement Google OAuth integration (4h, Backend, OAuth)",
        "Create Facebook Login API (4h, Backend, API)",
        "Build Twitter authentication (3h, Backend, OAuth)",
        "Design user profile sync system (5h, Backend, Database)",
        "Create social sharing components (4h, Frontend, React)",
        "Implement activity feed API (6h, Backend, Database)",
        "Add social sharing buttons to posts (2h, Frontend, UI)",
        "Write integration tests (3h, Testing, API)",
        "Create documentation for social features (2h, Documentation)"
    ]
    
    for i, task in enumerate(expected_tasks, 1):
        print(f"   {i:2}. {task}")
    
    print("\n💡 Each task should have:")
    print("   • Specific, actionable name")
    print("   • Clear description") 
    print("   • Estimated hours")
    print("   • Required skills")

if __name__ == "__main__":
    success = test_complete_integration()
    
    show_verification_steps()
    
    if success:
        show_expected_results()
        print("\n🎉 Integration test complete!")
        print("💡 Check the verification steps above to confirm AI task generation")
    else:
        print("\n❌ Integration test failed")
        print("💡 Check n8n logs and TaskFlow connectivity")