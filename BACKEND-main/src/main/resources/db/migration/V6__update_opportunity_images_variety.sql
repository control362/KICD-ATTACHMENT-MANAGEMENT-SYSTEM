-- Update existing opportunities with diverse generated image URLs
UPDATE opportunities
SET image_url = CASE 
    WHEN opportunity_id % 5 = 0 THEN '/kicd_professional_growth.png'
    WHEN opportunity_id % 5 = 1 THEN '/kicd_expert_mentorship.png'
    WHEN opportunity_id % 5 = 2 THEN '/kicd_innovation_education.png'
    WHEN opportunity_id % 5 = 3 THEN '/kicd_opportunity_tech.png'
    WHEN opportunity_id % 5 = 4 THEN '/kicd_opportunity_design.png'
END;
