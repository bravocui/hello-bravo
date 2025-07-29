"""
Mock data for the Personal Life Tracking API
This file contains all the sample data used for development and testing
"""

# Mock fitness data
MOCK_FITNESS_DATA = [
    {
        "id": 1,
        "date": "2024-01-15",
        "activity": "Running",
        "duration": 30,
        "calories": 300,
        "notes": "Morning run in the park"
    },
    {
        "id": 2,
        "date": "2024-01-14",
        "activity": "Weight Training",
        "duration": 45,
        "calories": 200,
        "notes": "Upper body workout"
    },
    {
        "id": 3,
        "date": "2024-01-13",
        "activity": "Cycling",
        "duration": 60,
        "calories": 500,
        "notes": "Mountain biking trail"
    }
]

# Mock travel data
MOCK_TRAVEL_DATA = [
    {
        "id": 1,
        "destination": "Zurich, Switzerland",
        "start_date": "2024-01-10",
        "end_date": "2024-01-15",
        "description": "Business trip to Zurich with some sightseeing. Visited the beautiful Lake Zurich and explored the historic Old Town.",
        "photos": [
            "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Zurich+Lake",
            "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Old+Town",
            "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Swiss+Alps"
        ],
        "rating": 5
    },
    {
        "id": 2,
        "destination": "Geneva, Switzerland",
        "start_date": "2023-12-20",
        "end_date": "2023-12-25",
        "description": "Christmas vacation in Geneva. Enjoyed the festive atmosphere and visited the famous Jet d'Eau fountain.",
        "photos": [
            "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Jet+d'Eau",
            "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Christmas+Market",
            "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=UN+Palace"
        ],
        "rating": 4
    },
    {
        "id": 3,
        "destination": "Lucerne, Switzerland",
        "start_date": "2023-11-15",
        "end_date": "2023-11-18",
        "description": "Weekend getaway to Lucerne. Walked across the famous Chapel Bridge and enjoyed the mountain views.",
        "photos": [
            "https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Chapel+Bridge",
            "https://via.placeholder.com/300x200/84CC16/FFFFFF?text=Mountain+View",
            "https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Lucerne+Lake"
        ],
        "rating": 5
    }
]

# Mock weather data for Swiss cities
MOCK_WEATHER_DATA = [
    {
        "location": "Zurich",
        "temperature": 12.5,
        "description": "Partly cloudy",
        "humidity": 65,
        "wind_speed": 8.2,
        "icon": "cloudy"
    },
    {
        "location": "Geneva",
        "temperature": 14.2,
        "description": "Sunny",
        "humidity": 58,
        "wind_speed": 5.1,
        "icon": "sunny"
    },
    {
        "location": "Bern",
        "temperature": 11.8,
        "description": "Light rain",
        "humidity": 72,
        "wind_speed": 6.8,
        "icon": "rainy"
    },
    {
        "location": "Basel",
        "temperature": 13.1,
        "description": "Overcast",
        "humidity": 68,
        "wind_speed": 7.3,
        "icon": "cloudy"
    }
]

# Comprehensive mock accounting ledger data
# Two owners: "Bravo C" and "Joseph L"
# Each has 3 credit cards with expenses in all categories monthly from 2022 Oct to 2025 June

MOCK_LEDGER_DATA = [
    {'id': 1, 'year': 2022, 'month': 10, 'category': 'Food & Dining', 'amount': 145.67, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Restaurant dinner'},
    {'id': 2, 'year': 2022, 'month': 10, 'category': 'Transportation', 'amount': 78.9, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Fuel and parking'},
    {'id': 3, 'year': 2022, 'month': 10, 'category': 'Entertainment', 'amount': 23.99, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Netflix subscription'},
    {'id': 4, 'year': 2022, 'month': 10, 'category': 'Shopping', 'amount': 234.5, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Amazon purchases'},
    {'id': 5, 'year': 2022, 'month': 10, 'category': 'Bills & Utilities', 'amount': 156.78, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Electricity bill'},
    {'id': 6, 'year': 2022, 'month': 11, 'category': 'Food & Dining', 'amount': 189.23, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Grocery shopping'},
    {'id': 7, 'year': 2022, 'month': 11, 'category': 'Transportation', 'amount': 92.45, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Uber rides'},
    {'id': 8, 'year': 2022, 'month': 11, 'category': 'Entertainment', 'amount': 45.0, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Movie tickets'},
    {'id': 9, 'year': 2022, 'month': 11, 'category': 'Shopping', 'amount': 167.89, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Clothing purchase'},
    {'id': 10, 'year': 2022, 'month': 11, 'category': 'Bills & Utilities', 'amount': 134.56, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Internet bill'},
    {'id': 11, 'year': 2022, 'month': 12, 'category': 'Food & Dining', 'amount': 267.34, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Holiday dining'},
    {'id': 12, 'year': 2022, 'month': 12, 'category': 'Transportation', 'amount': 123.67, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Airport parking'},
    {'id': 13, 'year': 2022, 'month': 12, 'category': 'Entertainment', 'amount': 89.99, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Concert tickets'},
    {'id': 14, 'year': 2022, 'month': 12, 'category': 'Shopping', 'amount': 456.78, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Christmas gifts'},
    {'id': 15, 'year': 2022, 'month': 12, 'category': 'Bills & Utilities', 'amount': 178.9, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Heating bill'},
    {'id': 16, 'year': 2022, 'month': 10, 'category': 'Food & Dining', 'amount': 134.56, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Fine dining'},
    {'id': 17, 'year': 2022, 'month': 10, 'category': 'Transportation', 'amount': 67.89, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Public transit'},
    {'id': 18, 'year': 2022, 'month': 10, 'category': 'Entertainment', 'amount': 34.99, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Spotify premium'},
    {'id': 19, 'year': 2022, 'month': 10, 'category': 'Shopping', 'amount': 189.23, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Electronics'},
    {'id': 20, 'year': 2022, 'month': 10, 'category': 'Bills & Utilities', 'amount': 145.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Phone bill'},
    {'id': 21, 'year': 2022, 'month': 11, 'category': 'Food & Dining', 'amount': 178.9, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Takeout meals'},
    {'id': 22, 'year': 2022, 'month': 11, 'category': 'Transportation', 'amount': 89.12, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Car maintenance'},
    {'id': 23, 'year': 2022, 'month': 11, 'category': 'Entertainment', 'amount': 56.78, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Gym membership'},
    {'id': 24, 'year': 2022, 'month': 11, 'category': 'Shopping', 'amount': 234.56, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Home goods'},
    {'id': 25, 'year': 2022, 'month': 11, 'category': 'Bills & Utilities', 'amount': 123.45, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Water bill'},
    {'id': 26, 'year': 2022, 'month': 12, 'category': 'Food & Dining', 'amount': 245.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Holiday feasts'},
    {'id': 27, 'year': 2022, 'month': 12, 'category': 'Transportation', 'amount': 156.78, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Rental car'},
    {'id': 28, 'year': 2022, 'month': 12, 'category': 'Entertainment', 'amount': 78.9, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Theater tickets'},
    {'id': 29, 'year': 2022, 'month': 12, 'category': 'Shopping', 'amount': 345.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Holiday shopping'},
    {'id': 30, 'year': 2022, 'month': 12, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Cable bill'},
    {'id': 31, 'year': 2022, 'month': 10, 'category': 'Food & Dining', 'amount': 98.76, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Coffee shops'},
    {'id': 32, 'year': 2022, 'month': 10, 'category': 'Transportation', 'amount': 45.67, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Gas station'},
    {'id': 33, 'year': 2022, 'month': 10, 'category': 'Entertainment', 'amount': 23.45, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Streaming services'},
    {'id': 34, 'year': 2022, 'month': 10, 'category': 'Shopping', 'amount': 123.45, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Online shopping'},
    {'id': 35, 'year': 2022, 'month': 10, 'category': 'Bills & Utilities', 'amount': 89.12, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Utility payment'},
    {'id': 36, 'year': 2022, 'month': 11, 'category': 'Food & Dining', 'amount': 112.34, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Lunch expenses'},
    {'id': 37, 'year': 2022, 'month': 11, 'category': 'Transportation', 'amount': 67.89, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Parking fees'},
    {'id': 38, 'year': 2022, 'month': 11, 'category': 'Entertainment', 'amount': 45.67, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Video games'},
    {'id': 39, 'year': 2022, 'month': 11, 'category': 'Shopping', 'amount': 178.9, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Department store'},
    {'id': 40, 'year': 2022, 'month': 11, 'category': 'Bills & Utilities', 'amount': 134.56, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Insurance payment'},
    {'id': 41, 'year': 2022, 'month': 12, 'category': 'Food & Dining', 'amount': 189.23, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Party supplies'},
    {'id': 42, 'year': 2022, 'month': 12, 'category': 'Transportation', 'amount': 98.76, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Toll fees'},
    {'id': 43, 'year': 2022, 'month': 12, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Holiday events'},
    {'id': 44, 'year': 2022, 'month': 12, 'category': 'Shopping', 'amount': 234.56, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Gift cards'},
    {'id': 45, 'year': 2022, 'month': 12, 'category': 'Bills & Utilities', 'amount': 145.67, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Security system'},
    {'id': 46, 'year': 2023, 'month': 1, 'category': 'Food & Dining', 'amount': 156.78, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'New Year dining'},
    {'id': 47, 'year': 2023, 'month': 1, 'category': 'Transportation', 'amount': 89.12, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Car wash'},
    {'id': 48, 'year': 2023, 'month': 1, 'category': 'Entertainment', 'amount': 34.56, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Movie night'},
    {'id': 49, 'year': 2023, 'month': 1, 'category': 'Shopping', 'amount': 198.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Post-holiday sales'},
    {'id': 50, 'year': 2023, 'month': 1, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'January utilities'},
    {'id': 51, 'year': 2022, 'month': 10, 'category': 'Food & Dining', 'amount': 167.89, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business lunch'},
    {'id': 52, 'year': 2022, 'month': 10, 'category': 'Transportation', 'amount': 123.45, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Flight tickets'},
    {'id': 53, 'year': 2022, 'month': 10, 'category': 'Entertainment', 'amount': 45.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Sports tickets'},
    {'id': 54, 'year': 2022, 'month': 10, 'category': 'Shopping', 'amount': 234.56, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business attire'},
    {'id': 55, 'year': 2022, 'month': 10, 'category': 'Bills & Utilities', 'amount': 178.9, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Office utilities'},
    {'id': 56, 'year': 2022, 'month': 11, 'category': 'Food & Dining', 'amount': 198.76, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Client dinners'},
    {'id': 57, 'year': 2022, 'month': 11, 'category': 'Transportation', 'amount': 156.78, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Rental car'},
    {'id': 58, 'year': 2022, 'month': 11, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Concert tickets'},
    {'id': 59, 'year': 2022, 'month': 11, 'category': 'Shopping', 'amount': 345.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Electronics'},
    {'id': 60, 'year': 2022, 'month': 11, 'category': 'Bills & Utilities', 'amount': 189.23, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Internet service'},
    {'id': 61, 'year': 2022, 'month': 12, 'category': 'Food & Dining', 'amount': 245.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Holiday parties'},
    {'id': 62, 'year': 2022, 'month': 12, 'category': 'Transportation', 'amount': 234.56, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'International travel'},
    {'id': 63, 'year': 2022, 'month': 12, 'category': 'Entertainment', 'amount': 89.12, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Theater show'},
    {'id': 64, 'year': 2022, 'month': 12, 'category': 'Shopping', 'amount': 456.78, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Luxury items'},
    {'id': 65, 'year': 2022, 'month': 12, 'category': 'Bills & Utilities', 'amount': 198.76, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Premium services'},
    {'id': 66, 'year': 2022, 'month': 10, 'category': 'Food & Dining', 'amount': 134.56, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Grocery shopping'},
    {'id': 67, 'year': 2022, 'month': 10, 'category': 'Transportation', 'amount': 78.9, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Gas and maintenance'},
    {'id': 68, 'year': 2022, 'month': 10, 'category': 'Entertainment', 'amount': 34.99, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Streaming subscriptions'},
    {'id': 69, 'year': 2022, 'month': 10, 'category': 'Shopping', 'amount': 189.23, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Home improvement'},
    {'id': 70, 'year': 2022, 'month': 10, 'category': 'Bills & Utilities', 'amount': 145.67, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Phone and data'},
    {'id': 71, 'year': 2022, 'month': 11, 'category': 'Food & Dining', 'amount': 167.89, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Restaurant meals'},
    {'id': 72, 'year': 2022, 'month': 11, 'category': 'Transportation', 'amount': 98.76, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Public transportation'},
    {'id': 73, 'year': 2022, 'month': 11, 'category': 'Entertainment', 'amount': 56.78, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Gym membership'},
    {'id': 74, 'year': 2022, 'month': 11, 'category': 'Shopping', 'amount': 234.56, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Clothing and accessories'},
    {'id': 75, 'year': 2022, 'month': 11, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Electricity bill'},
    {'id': 76, 'year': 2022, 'month': 12, 'category': 'Food & Dining', 'amount': 223.45, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Holiday feasts'},
    {'id': 77, 'year': 2022, 'month': 12, 'category': 'Transportation', 'amount': 145.67, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Holiday travel'},
    {'id': 78, 'year': 2022, 'month': 12, 'category': 'Entertainment', 'amount': 78.9, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Family entertainment'},
    {'id': 79, 'year': 2022, 'month': 12, 'category': 'Shopping', 'amount': 345.67, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Holiday gifts'},
    {'id': 80, 'year': 2022, 'month': 12, 'category': 'Bills & Utilities', 'amount': 178.9, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Heating and cooling'},
    {'id': 81, 'year': 2022, 'month': 10, 'category': 'Food & Dining', 'amount': 98.76, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Coffee and snacks'},
    {'id': 82, 'year': 2022, 'month': 10, 'category': 'Transportation', 'amount': 67.89, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Parking and tolls'},
    {'id': 83, 'year': 2022, 'month': 10, 'category': 'Entertainment', 'amount': 23.45, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Digital downloads'},
    {'id': 84, 'year': 2022, 'month': 10, 'category': 'Shopping', 'amount': 156.78, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Online purchases'},
    {'id': 85, 'year': 2022, 'month': 10, 'category': 'Bills & Utilities', 'amount': 123.45, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Utility payments'},
    {'id': 86, 'year': 2022, 'month': 11, 'category': 'Food & Dining', 'amount': 145.67, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Lunch expenses'},
    {'id': 87, 'year': 2022, 'month': 11, 'category': 'Transportation', 'amount': 89.12, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Car services'},
    {'id': 88, 'year': 2022, 'month': 11, 'category': 'Entertainment', 'amount': 45.67, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Hobby expenses'},
    {'id': 89, 'year': 2022, 'month': 11, 'category': 'Shopping', 'amount': 198.76, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Department stores'},
    {'id': 90, 'year': 2022, 'month': 11, 'category': 'Bills & Utilities', 'amount': 134.56, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Insurance premium'},
    {'id': 91, 'year': 2022, 'month': 12, 'category': 'Food & Dining', 'amount': 189.23, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Party catering'},
    {'id': 92, 'year': 2022, 'month': 12, 'category': 'Transportation', 'amount': 112.34, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Holiday travel'},
    {'id': 93, 'year': 2022, 'month': 12, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Event tickets'},
    {'id': 94, 'year': 2022, 'month': 12, 'category': 'Shopping', 'amount': 267.89, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Holiday shopping'},
    {'id': 95, 'year': 2022, 'month': 12, 'category': 'Bills & Utilities', 'amount': 156.78, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Security services'},
    {'id': 96, 'year': 2023, 'month': 1, 'category': 'Food & Dining', 'amount': 178.9, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'New Year celebration'},
    {'id': 97, 'year': 2023, 'month': 1, 'category': 'Transportation', 'amount': 98.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Car maintenance'},
    {'id': 98, 'year': 2023, 'month': 1, 'category': 'Entertainment', 'amount': 45.67, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Streaming services'},
    {'id': 99, 'year': 2023, 'month': 1, 'category': 'Shopping', 'amount': 223.45, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Post-holiday sales'},
    {'id': 100, 'year': 2023, 'month': 1, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'January utilities'},
    {'id': 101, 'year': 2023, 'month': 1, 'category': 'Food & Dining', 'amount': 198.76, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business dining'},
    {'id': 102, 'year': 2023, 'month': 1, 'category': 'Transportation', 'amount': 145.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business travel'},
    {'id': 103, 'year': 2023, 'month': 1, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Client entertainment'},
    {'id': 104, 'year': 2023, 'month': 1, 'category': 'Shopping', 'amount': 345.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business expenses'},
    {'id': 105, 'year': 2023, 'month': 1, 'category': 'Bills & Utilities', 'amount': 189.23, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Office utilities'},
    {'id': 106, 'year': 2024, 'month': 1, 'category': 'Food & Dining', 'amount': 167.89, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'January dining'},
    {'id': 107, 'year': 2024, 'month': 1, 'category': 'Transportation', 'amount': 89.12, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Fuel expenses'},
    {'id': 108, 'year': 2024, 'month': 1, 'category': 'Entertainment', 'amount': 34.56, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Entertainment'},
    {'id': 109, 'year': 2024, 'month': 1, 'category': 'Shopping', 'amount': 198.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Shopping'},
    {'id': 110, 'year': 2024, 'month': 1, 'category': 'Bills & Utilities', 'amount': 145.67, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Utilities'},
    {'id': 111, 'year': 2024, 'month': 1, 'category': 'Food & Dining', 'amount': 189.23, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business meals'},
    {'id': 112, 'year': 2024, 'month': 1, 'category': 'Transportation', 'amount': 156.78, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Travel expenses'},
    {'id': 113, 'year': 2024, 'month': 1, 'category': 'Entertainment', 'amount': 78.9, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Client entertainment'},
    {'id': 114, 'year': 2024, 'month': 1, 'category': 'Shopping', 'amount': 267.89, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business purchases'},
    {'id': 115, 'year': 2024, 'month': 1, 'category': 'Bills & Utilities', 'amount': 178.9, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Office bills'},
    {'id': 116, 'year': 2025, 'month': 6, 'category': 'Food & Dining', 'amount': 178.9, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Summer dining'},
    {'id': 117, 'year': 2025, 'month': 6, 'category': 'Transportation', 'amount': 98.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Summer travel'},
    {'id': 118, 'year': 2025, 'month': 6, 'category': 'Entertainment', 'amount': 45.67, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Summer entertainment'},
    {'id': 119, 'year': 2025, 'month': 6, 'category': 'Shopping', 'amount': 223.45, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Summer shopping'},
    {'id': 120, 'year': 2025, 'month': 6, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Summer utilities'},
    {'id': 121, 'year': 2025, 'month': 6, 'category': 'Food & Dining', 'amount': 198.76, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business summer dining'},
    {'id': 122, 'year': 2025, 'month': 6, 'category': 'Transportation', 'amount': 145.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Summer business travel'},
    {'id': 123, 'year': 2025, 'month': 6, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Summer client events'},
    {'id': 124, 'year': 2025, 'month': 6, 'category': 'Shopping', 'amount': 345.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Summer business expenses'},
    {'id': 125, 'year': 2025, 'month': 6, 'category': 'Bills & Utilities', 'amount': 189.23, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Summer office utilities'},
    {'id': 126, 'year': 2024, 'month': 2, 'category': 'Food & Dining', 'amount': 145.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bravo C', 'notes': 'Valentine\'s dinner'},
    {'id': 127, 'year': 2024, 'month': 2, 'category': 'Transportation', 'amount': 78.9, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Business travel'},
    {'id': 128, 'year': 2024, 'month': 2, 'category': 'Entertainment', 'amount': 89.99, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bo Cui', 'notes': 'Concert tickets'},
    {'id': 129, 'year': 2024, 'month': 3, 'category': 'Shopping', 'amount': 234.56, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Spring shopping'},
    {'id': 130, 'year': 2024, 'month': 3, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Office utilities'},
    {'id': 131, 'year': 2024, 'month': 3, 'category': 'Food & Dining', 'amount': 198.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Restaurant meals'},
    {'id': 132, 'year': 2024, 'month': 4, 'category': 'Transportation', 'amount': 123.45, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'Business travel'},
    {'id': 133, 'year': 2024, 'month': 4, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'Movie night'},
    {'id': 134, 'year': 2024, 'month': 4, 'category': 'Shopping', 'amount': 189.23, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Online purchases'},
    {'id': 135, 'year': 2024, 'month': 5, 'category': 'Bills & Utilities', 'amount': 145.67, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'May utilities'},
    {'id': 136, 'year': 2024, 'month': 5, 'category': 'Food & Dining', 'amount': 178.9, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business dining'},
    {'id': 137, 'year': 2024, 'month': 5, 'category': 'Transportation', 'amount': 98.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Car maintenance'},
    {'id': 138, 'year': 2024, 'month': 6, 'category': 'Entertainment', 'amount': 45.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'Summer events'},
    {'id': 139, 'year': 2024, 'month': 6, 'category': 'Shopping', 'amount': 223.45, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'Summer shopping'},
    {'id': 140, 'year': 2024, 'month': 6, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'June utilities'},
    {'id': 141, 'year': 2024, 'month': 7, 'category': 'Food & Dining', 'amount': 198.76, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Summer dining'},
    {'id': 142, 'year': 2024, 'month': 7, 'category': 'Transportation', 'amount': 156.78, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Vacation travel'},
    {'id': 143, 'year': 2024, 'month': 7, 'category': 'Entertainment', 'amount': 78.9, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Summer entertainment'},
    {'id': 144, 'year': 2024, 'month': 8, 'category': 'Shopping', 'amount': 267.89, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'Back to school'},
    {'id': 145, 'year': 2024, 'month': 8, 'category': 'Bills & Utilities', 'amount': 189.23, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'August utilities'},
    {'id': 146, 'year': 2024, 'month': 8, 'category': 'Food & Dining', 'amount': 167.89, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Business meals'},
    {'id': 147, 'year': 2024, 'month': 9, 'category': 'Transportation', 'amount': 123.45, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Commuting costs'},
    {'id': 148, 'year': 2024, 'month': 9, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Client entertainment'},
    {'id': 149, 'year': 2024, 'month': 9, 'category': 'Shopping', 'amount': 198.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Fall shopping'},
    {'id': 150, 'year': 2024, 'month': 10, 'category': 'Bills & Utilities', 'amount': 145.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'October utilities'},
    {'id': 151, 'year': 2024, 'month': 10, 'category': 'Food & Dining', 'amount': 178.9, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'Halloween party'},
    {'id': 152, 'year': 2024, 'month': 10, 'category': 'Transportation', 'amount': 98.76, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Business travel'},
    {'id': 153, 'year': 2024, 'month': 11, 'category': 'Entertainment', 'amount': 89.99, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'Thanksgiving events'},
    {'id': 154, 'year': 2024, 'month': 11, 'category': 'Shopping', 'amount': 345.67, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Black Friday'},
    {'id': 155, 'year': 2024, 'month': 11, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'November utilities'},
    {'id': 156, 'year': 2024, 'month': 12, 'category': 'Food & Dining', 'amount': 245.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'Holiday feasts'},
    {'id': 157, 'year': 2024, 'month': 12, 'category': 'Transportation', 'amount': 234.56, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'Holiday travel'},
    {'id': 158, 'year': 2024, 'month': 12, 'category': 'Entertainment', 'amount': 123.45, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Christmas events'},
    {'id': 159, 'year': 2025, 'month': 1, 'category': 'Shopping', 'amount': 198.76, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'New Year sales'},
    {'id': 160, 'year': 2025, 'month': 1, 'category': 'Bills & Utilities', 'amount': 178.9, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'January office bills'},
    {'id': 161, 'year': 2025, 'month': 1, 'category': 'Food & Dining', 'amount': 167.89, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'New Year dining'},
    {'id': 162, 'year': 2025, 'month': 2, 'category': 'Transportation', 'amount': 145.67, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'Business travel'},
    {'id': 163, 'year': 2025, 'month': 2, 'category': 'Entertainment', 'amount': 78.9, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'Valentine\'s entertainment'},
    {'id': 164, 'year': 2025, 'month': 2, 'category': 'Shopping', 'amount': 223.45, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'February shopping'},
    {'id': 165, 'year': 2025, 'month': 3, 'category': 'Bills & Utilities', 'amount': 156.78, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'March utilities'},
    {'id': 166, 'year': 2025, 'month': 3, 'category': 'Food & Dining', 'amount': 189.23, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business dining'},
    {'id': 167, 'year': 2025, 'month': 3, 'category': 'Transportation', 'amount': 98.76, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'Spring travel'},
    {'id': 168, 'year': 2025, 'month': 4, 'category': 'Entertainment', 'amount': 67.89, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'April events'},
    {'id': 169, 'year': 2025, 'month': 4, 'category': 'Shopping', 'amount': 267.89, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'Spring shopping'},
    {'id': 170, 'year': 2025, 'month': 4, 'category': 'Bills & Utilities', 'amount': 145.67, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'April utilities'},
    {'id': 171, 'year': 2025, 'month': 5, 'category': 'Food & Dining', 'amount': 198.76, 'credit_card': 'Citi Double Cash', 'user_name': 'Bravo C', 'notes': 'May dining'},
    {'id': 172, 'year': 2025, 'month': 5, 'category': 'Transportation', 'amount': 123.45, 'credit_card': 'Capital One Venture', 'user_name': 'Bo Cui', 'notes': 'Business travel'},
    {'id': 173, 'year': 2025, 'month': 5, 'category': 'Entertainment', 'amount': 89.99, 'credit_card': 'Chase Sapphire Reserve', 'user_name': 'Bravo C', 'notes': 'May entertainment'},
    {'id': 174, 'year': 2025, 'month': 6, 'category': 'Shopping', 'amount': 234.56, 'credit_card': 'Amex Gold Card', 'user_name': 'Bo Cui', 'notes': 'Summer shopping'},
    {'id': 175, 'year': 2025, 'month': 6, 'category': 'Bills & Utilities', 'amount': 167.89, 'credit_card': 'Wells Fargo Active Cash', 'user_name': 'Bravo C', 'notes': 'June utilities'},
    {'id': 176, 'year': 2025, 'month': 6, 'category': 'Food & Dining', 'amount': 178.9, 'credit_card': 'Discover It', 'user_name': 'Bo Cui', 'notes': 'Summer dining'}
]

# Mock user data
MOCK_USERS = {
    "demo-token": {
        "email": "bravocui@gmail.com",
        "name": "Bravo C",
        "picture": "https://via.placeholder.com/150"
    },
    "default-token": {
        "email": "user@example.com",
        "name": "John Doe",
        "picture": "https://via.placeholder.com/150"
    }
} 