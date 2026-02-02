import { useState } from 'react';
import { Shield, Lock, Database, FileCheck, ChevronRight, X, Check, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PresetStandard {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  keyRequirements: string[];
  extractedText: string;
}

const PRESET_STANDARDS: PresetStandard[] = [
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation',
    shortName: 'GDPR',
    description: 'EU regulation on data protection and privacy for individuals within the European Union and European Economic Area.',
    icon: <Shield className="h-6 w-6" />,
    category: 'Data Privacy',
    keyRequirements: [
      'Lawful basis for processing',
      'Data subject rights',
      'Data breach notification',
      'Privacy by design',
      'Data Protection Officer',
      'Cross-border data transfers'
    ],
    extractedText: `GENERAL DATA PROTECTION REGULATION (GDPR) - KEY COMPLIANCE REQUIREMENTS

ARTICLE 5 - PRINCIPLES RELATING TO PROCESSING OF PERSONAL DATA
1. Personal data shall be:
(a) processed lawfully, fairly and in a transparent manner in relation to the data subject ('lawfulness, fairness and transparency');
(b) collected for specified, explicit and legitimate purposes and not further processed in a manner that is incompatible with those purposes ('purpose limitation');
(c) adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed ('data minimisation');
(d) accurate and, where necessary, kept up to date ('accuracy');
(e) kept in a form which permits identification of data subjects for no longer than is necessary ('storage limitation');
(f) processed in a manner that ensures appropriate security of the personal data ('integrity and confidentiality').

ARTICLE 6 - LAWFULNESS OF PROCESSING
Processing shall be lawful only if and to the extent that at least one of the following applies:
(a) the data subject has given consent to the processing;
(b) processing is necessary for the performance of a contract;
(c) processing is necessary for compliance with a legal obligation;
(d) processing is necessary to protect vital interests;
(e) processing is necessary for a task carried out in the public interest;
(f) processing is necessary for legitimate interests pursued by the controller.

ARTICLE 7 - CONDITIONS FOR CONSENT
The controller shall be able to demonstrate that the data subject has consented. Consent must be freely given, specific, informed and unambiguous. Data subject has right to withdraw consent at any time.

ARTICLE 12-23 - RIGHTS OF THE DATA SUBJECT
- Right to access personal data
- Right to rectification
- Right to erasure ('right to be forgotten')
- Right to restriction of processing
- Right to data portability
- Right to object to processing
- Rights related to automated decision making and profiling

ARTICLE 25 - DATA PROTECTION BY DESIGN AND BY DEFAULT
The controller shall implement appropriate technical and organisational measures for ensuring that, by default, only personal data which are necessary for each specific purpose are processed.

ARTICLE 32 - SECURITY OF PROCESSING
Controllers and processors must implement appropriate technical and organisational measures including:
- Pseudonymisation and encryption of personal data
- Ability to ensure confidentiality, integrity, availability
- Ability to restore availability and access to personal data
- Process for regularly testing security measures

ARTICLE 33-34 - DATA BREACH NOTIFICATION
Personal data breaches must be notified to supervisory authority within 72 hours. High-risk breaches must also be communicated to affected data subjects.

ARTICLE 35 - DATA PROTECTION IMPACT ASSESSMENT
Required when processing is likely to result in high risk to rights and freedoms of natural persons.

ARTICLE 37-39 - DATA PROTECTION OFFICER
Required for public authorities, large-scale systematic monitoring, or large-scale processing of special categories of data.

ARTICLE 44-49 - TRANSFERS TO THIRD COUNTRIES
Personal data transfers outside EEA only permitted with adequate safeguards (adequacy decisions, SCCs, BCRs, etc.)`
  },
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    shortName: 'SOC 2',
    description: 'AICPA framework for managing customer data based on five trust service criteria: security, availability, processing integrity, confidentiality, and privacy.',
    icon: <Lock className="h-6 w-6" />,
    category: 'Security',
    keyRequirements: [
      'Access controls',
      'Change management',
      'Risk assessment',
      'Incident response',
      'Vendor management',
      'Encryption standards'
    ],
    extractedText: `SOC 2 TYPE II - TRUST SERVICES CRITERIA COMPLIANCE REQUIREMENTS

SECURITY (COMMON CRITERIA)
CC1 - CONTROL ENVIRONMENT
CC1.1: The entity demonstrates a commitment to integrity and ethical values.
CC1.2: The board of directors demonstrates independence and exercises oversight.
CC1.3: Management establishes structures, reporting lines, and authorities.
CC1.4: The entity demonstrates commitment to attract, develop, and retain competent individuals.
CC1.5: The entity holds individuals accountable for their internal control responsibilities.

CC2 - COMMUNICATION AND INFORMATION
CC2.1: The entity obtains or generates and uses relevant, quality information.
CC2.2: The entity internally communicates information necessary for internal controls.
CC2.3: The entity communicates with external parties regarding internal control matters.

CC3 - RISK ASSESSMENT
CC3.1: The entity specifies objectives with sufficient clarity to enable identification of risks.
CC3.2: The entity identifies risks to the achievement of objectives and analyzes risks.
CC3.3: The entity considers the potential for fraud in assessing risks.
CC3.4: The entity identifies and assesses changes that could significantly impact internal controls.

CC4 - MONITORING ACTIVITIES
CC4.1: The entity selects, develops, and performs ongoing and/or separate evaluations.
CC4.2: The entity evaluates and communicates internal control deficiencies in a timely manner.

CC5 - CONTROL ACTIVITIES
CC5.1: The entity selects and develops control activities that contribute to risk mitigation.
CC5.2: The entity selects and develops general controls over technology.
CC5.3: The entity deploys control activities through policies and procedures.

CC6 - LOGICAL AND PHYSICAL ACCESS CONTROLS
CC6.1: The entity implements logical access security software, infrastructure, and architectures.
CC6.2: Prior to issuing system credentials, the entity registers and authorizes new users.
CC6.3: The entity authorizes, modifies, or removes access to data and systems.
CC6.4: The entity restricts physical access to facilities and protected information assets.
CC6.5: The entity discontinues logical and physical protections when no longer needed.
CC6.6: The entity implements logical access security measures against threats.
CC6.7: The entity restricts the transmission of data to authorized users.
CC6.8: The entity implements controls to prevent or detect unauthorized software.

CC7 - SYSTEM OPERATIONS
CC7.1: The entity uses detection and monitoring procedures to identify security events.
CC7.2: The entity monitors system components for anomalies indicative of malicious acts.
CC7.3: The entity evaluates security events to determine if they are security incidents.
CC7.4: The entity responds to identified security incidents by executing response procedures.
CC7.5: The entity identifies, develops, and implements remediation activities.

CC8 - CHANGE MANAGEMENT
CC8.1: The entity authorizes, designs, develops, configures, tests, and implements changes.

CC9 - RISK MITIGATION
CC9.1: The entity identifies, selects, and develops risk mitigation activities.
CC9.2: The entity assesses and manages risks associated with vendors and partners.

AVAILABILITY CRITERIA
A1.1: The entity maintains, monitors, and evaluates current processing capacity.
A1.2: The entity authorizes, designs, develops, implements, and maintains system recovery.
A1.3: The entity tests recovery plan procedures supporting system recovery.

CONFIDENTIALITY CRITERIA
C1.1: The entity identifies and maintains confidential information.
C1.2: The entity disposes of confidential information.

PROCESSING INTEGRITY CRITERIA
PI1.1: The entity obtains or generates, uses, and communicates quality information.
PI1.2: The entity implements policies and procedures for system inputs.
PI1.3: The entity implements policies and procedures for system processing.
PI1.4: The entity implements policies and procedures for system outputs.
PI1.5: The entity implements policies and procedures to store inputs, items in processing, and outputs.

PRIVACY CRITERIA
P1-P8: Notice, choice, collection, use, access, disclosure, quality, and monitoring requirements.`
  },
  {
    id: 'hipaa',
    name: 'Health Insurance Portability and Accountability Act',
    shortName: 'HIPAA',
    description: 'US legislation that provides data privacy and security provisions for safeguarding medical information.',
    icon: <Database className="h-6 w-6" />,
    category: 'Healthcare',
    keyRequirements: [
      'PHI safeguards',
      'Access controls',
      'Audit controls',
      'Transmission security',
      'Business associate agreements',
      'Breach notification'
    ],
    extractedText: `HIPAA COMPLIANCE REQUIREMENTS - SECURITY AND PRIVACY RULES

ADMINISTRATIVE SAFEGUARDS (§164.308)

(a)(1) SECURITY MANAGEMENT PROCESS
- Conduct accurate and thorough risk analysis
- Implement security measures to reduce risks and vulnerabilities
- Apply appropriate sanctions against workforce members who violate policies
- Implement procedures to regularly review records of system activity

(a)(2) ASSIGNED SECURITY RESPONSIBILITY
Identify the security official responsible for developing and implementing policies and procedures.

(a)(3) WORKFORCE SECURITY
- Implement procedures for authorization and/or supervision of workforce members
- Implement procedures to determine appropriate access for workforce members
- Implement procedures for terminating access when employment ends

(a)(4) INFORMATION ACCESS MANAGEMENT
- Implement policies and procedures for authorizing access to ePHI
- Implement policies and procedures for granting access to workstations and systems
- Implement policies and procedures for documenting access modifications

(a)(5) SECURITY AWARENESS AND TRAINING
- Implement security reminders
- Implement procedures for guarding against malicious software
- Implement procedures for monitoring log-in attempts
- Implement procedures for creating, changing, and safeguarding passwords

(a)(6) SECURITY INCIDENT PROCEDURES
Implement policies and procedures to address security incidents, including identification, response, mitigation, and documentation.

(a)(7) CONTINGENCY PLAN
- Establish and implement data backup plan
- Establish and implement disaster recovery plan
- Establish and implement emergency mode operation plan
- Implement procedures for periodic testing and revision
- Assess criticality of applications and data

(a)(8) EVALUATION
Perform periodic technical and non-technical evaluation of security policies and procedures.

PHYSICAL SAFEGUARDS (§164.310)

(a)(1) FACILITY ACCESS CONTROLS
- Implement policies and procedures to limit physical access
- Implement procedures to safeguard facility and equipment from unauthorized access
- Implement procedures to control and validate access based on role
- Document repairs and modifications to physical security components

(b)(1) WORKSTATION USE
Implement policies and procedures for proper functions, manner, and physical attributes of workstations.

(c)(1) DEVICE AND MEDIA CONTROLS
- Implement policies for final disposal of ePHI and hardware
- Implement procedures for removal of ePHI before reuse of media
- Maintain record of movements of hardware and electronic media
- Create retrievable exact copy of ePHI before movement of equipment

TECHNICAL SAFEGUARDS (§164.312)

(a)(1) ACCESS CONTROL
- Assign unique user identification to each user
- Establish emergency access procedure
- Implement automatic logoff after period of inactivity
- Implement mechanism to encrypt and decrypt ePHI

(b) AUDIT CONTROLS
Implement hardware, software, and procedural mechanisms to record and examine access and activity.

(c)(1) INTEGRITY
Implement policies and procedures to protect ePHI from improper alteration or destruction.

(d) PERSON OR ENTITY AUTHENTICATION
Implement procedures to verify identity of persons or entities seeking access to ePHI.

(e)(1) TRANSMISSION SECURITY
- Implement security measures to ensure ePHI is not improperly modified during transmission
- Implement mechanism to encrypt ePHI during transmission when appropriate

PRIVACY RULE REQUIREMENTS

- Minimum Necessary Standard: Limit PHI use and disclosure to minimum necessary
- Patient Rights: Access, amendment, accounting of disclosures, restrictions
- Notice of Privacy Practices: Describe how PHI may be used and disclosed
- Business Associate Agreements: Required for all business associates handling PHI
- Authorization Requirements: Specific authorizations for uses beyond TPO
- De-identification Standards: Safe harbor or expert determination methods

BREACH NOTIFICATION RULE

- Notify affected individuals within 60 days of breach discovery
- Notify HHS for breaches affecting 500+ individuals within 60 days
- Maintain breach log and report annually for breaches under 500 individuals
- Notify media for breaches affecting 500+ individuals in a state/jurisdiction`
  },
  {
    id: 'ccpa',
    name: 'California Consumer Privacy Act',
    shortName: 'CCPA',
    description: 'California state statute intended to enhance privacy rights and consumer protection for residents of California.',
    icon: <FileCheck className="h-6 w-6" />,
    category: 'Data Privacy',
    keyRequirements: [
      'Right to know',
      'Right to delete',
      'Right to opt-out',
      'Non-discrimination',
      'Privacy policy updates',
      'Data inventory'
    ],
    extractedText: `CALIFORNIA CONSUMER PRIVACY ACT (CCPA) - COMPLIANCE REQUIREMENTS

SECTION 1798.100 - CONSUMER RIGHT TO KNOW

(a) A consumer shall have the right to request that a business disclose:
1. The categories of personal information it has collected about that consumer
2. The categories of sources from which the personal information is collected
3. The business or commercial purpose for collecting or selling personal information
4. The categories of third parties with whom the business shares personal information
5. The specific pieces of personal information it has collected about that consumer

(b) A business that collects personal information shall, at or before the point of collection, inform consumers of the categories of personal information to be collected and the purposes for which they will be used.

SECTION 1798.105 - CONSUMER RIGHT TO DELETE

(a) A consumer shall have the right to request that a business delete any personal information about the consumer which the business has collected from the consumer.

(b) A business that collects personal information shall disclose the consumer's right to request deletion.

(c) A business that receives a verifiable consumer request shall delete the consumer's personal information and direct any service providers to delete the consumer's personal information.

EXCEPTIONS TO DELETION:
- Complete the transaction for which the personal information was collected
- Detect security incidents
- Debug to identify and repair errors
- Exercise free speech or other legal rights
- Comply with legal obligations
- Use internally in a manner compatible with reasonable consumer expectations

SECTION 1798.110 - RIGHT TO KNOW WHAT PERSONAL INFORMATION IS COLLECTED

A business shall provide the following information upon receipt of a verifiable request:
1. Categories of personal information collected in the preceding 12 months
2. Categories of sources from which personal information is collected
3. Business or commercial purpose for collecting or selling personal information
4. Categories of third parties with whom personal information is shared
5. Specific pieces of personal information collected about the consumer

SECTION 1798.115 - RIGHT TO KNOW ABOUT SALE/DISCLOSURE OF PERSONAL INFORMATION

A consumer shall have the right to request disclosure of:
1. Categories of personal information collected
2. Categories of personal information sold and categories of third parties to whom sold
3. Categories of personal information disclosed for business purposes

SECTION 1798.120 - RIGHT TO OPT-OUT OF SALE OF PERSONAL INFORMATION

(a) A consumer shall have the right to direct a business that sells personal information to not sell that consumer's personal information ("right to opt-out").

(b) A business shall not sell personal information of consumers if it has actual knowledge that the consumer is less than 16 years of age.

(c) A business that sells personal information shall provide a clear and conspicuous link on its homepage titled "Do Not Sell My Personal Information" that enables a consumer to opt-out.

SECTION 1798.125 - NON-DISCRIMINATION

(a) A business shall not discriminate against a consumer because the consumer exercised any of the consumer's rights, including:
1. Denying goods or services to the consumer
2. Charging different prices or rates for goods or services
3. Providing a different level or quality of goods or services
4. Suggesting that the consumer will receive a different price or rate or different level or quality

(b) Financial incentive practices are permitted if material terms are disclosed and consumer has opted-in.

SECTION 1798.130 - BUSINESS RESPONSIBILITIES

A business shall:
1. Make available two or more designated methods for submitting requests
2. Disclose and deliver required information within 45 days of receiving a verifiable request
3. Not require consumer to create an account to make a request
4. Use personal information received only for verification purposes
5. Provide training and information to personnel handling consumer inquiries

SECTION 1798.135 - HOMEPAGE REQUIREMENTS

A business that is required to comply shall:
1. Provide a "Do Not Sell My Personal Information" link on homepage
2. Provide a description of consumer's rights
3. Provide a designated method for submitting opt-out requests
4. Respond to opt-out requests within 15 business days

SECTION 1798.140 - DEFINITIONS

"Personal Information" includes: identifiers, commercial information, biometric information, internet/electronic network activity, geolocation data, audio/visual information, professional/employment information, education information, and inferences drawn from the above.

"Sale" means selling, renting, releasing, disclosing, disseminating, making available, or transferring a consumer's personal information for monetary or other valuable consideration.`
  },
  {
    id: 'gsf',
    name: 'Global Sustainability Framework',
    shortName: 'GSF',
    description: 'Comprehensive framework for evaluating environmental impact, carbon footprint, and sustainable business practices.',
    icon: <Leaf className="h-6 w-6" />,
    category: 'Environmental',
    keyRequirements: [
      'SDG Goals Alignment',
      'Net Zero & GHG (Scope 1-3)',
      'Human Rights & DEI',
      'Anti-Corruption & Bribery',
      'Whistleblower Policy',
      'Data Security & Privacy',
      'Health & Safety'
    ],
    extractedText: `GLOBAL SUSTAINABILITY FRAMEWORK (GSF) - ESG COMPLIANCE STANDARDS

ARTICLE 1 - ENVIRONMENTAL (PLANET)
1.1 Climate Action (SDG 13): The entity must align with UN Sustainable Development Goals (SDGs), specifically Goal 13 (Climate Action).
1.2 GHG Emissions: Mandatory monitoring and reduction of Greenhouse Gas (GHG) emissions across Scope 1, 2, and 3.
1.3 Environmental Monitoring: Regular testing of Air Quality, Water Quality, and Noise pollution levels to ensure they stay within safe limits.
1.4 Waste Management: Implementation of rigorous waste sorting, recycling, and hazardous waste disposal protocols.
1.5 Zero Waste Strategy: Aim for 'Zero Waste to Landfill' through circular economy principles.

ARTICLE 2 - SOCIAL (PEOPLE)
2.1 DEI (Diversity, Equity, and Inclusion): Organization must have a clear policy promoting diversity in hiring and leadership.
2.2 Human Rights: Strict adherence to international human rights standards; zero tolerance for forced labor or child labor in the supply chain.
2.3 Working Conditions: Guarantee of safe, healthy, and dignified working conditions for all employees and contractors.
2.4 Health and Safety: Regular safety audits, provision of PPE, and mental health support for workers.
2.5 Employee Benefits: Fair living wages, health insurance, and parental leave benefits.
2.6 Gender Pay Parity: Commitment to equal pay for equal work regardless of gender.

ARTICLE 3 - GOVERNANCE (PRINCIPLES)
3.1 Risk Management: robust framework for identifying and mitigating ESG-related risks.
3.2 Anti-Corruption & Bribery: Strict anti-bribery policies and internal controls to prevent corruption.
3.3 Whistleblower Policy: A confidential, anonymous grievance redressal mechanism for employees to report misconduct without fear of retaliation.
3.4 Cybersecurity Board Structure: Board-level oversight of Data Privacy and Cybersecurity risks.
3.5 Sustainability Reporting: Annual reporting following recognized standards (e.g., GRI, SASB) to ensure transparency.
3.6 Privacy and Data Security: Enhanced protection of customer and employee data in compliance with global privacy laws.`
  },
  {
    id: 'iso14001',
    name: 'ISO 14001:2015 - Environmental Management Systems',
    shortName: 'ISO 14001',
    description: 'The gold standard international framework for establishing, implementing, and improving environmental management systems (EMS).',
    icon: <Shield className="h-6 w-6" />,
    category: 'Environmental',
    keyRequirements: [
      'Environmental Policy',
      'Legal Compliance',
      'Environmental Objectives',
      'Operational Controls',
      'Emergency Preparedness',
      'Performance Evaluation',
      'Continual Improvement'
    ],
    extractedText: `ISO 14001:2015 - ENVIRONMENTAL MANAGEMENT SYSTEMS (EMS) 🏆

CLAUSE 4 - CONTEXT OF THE ORGANIZATION

4.1 Understanding the Organization and its Context
The organization shall determine external and internal issues relevant to its purpose and that affect its ability to achieve intended outcomes of its environmental management system.

4.2 Understanding Needs and Expectations of Interested Parties
The organization shall determine:
(a) interested parties that are relevant to the EMS
(b) the relevant needs and expectations of these interested parties
(c) which of these become compliance obligations

4.3 Determining the Scope of the EMS
The organization shall determine boundaries and applicability of the EMS, considering:
- External and internal issues
- Compliance obligations
- Organizational units, functions, and physical boundaries
- Activities, products, and services
- Authority and ability to exercise control and influence

4.4 Environmental Management System
The organization shall establish, implement, maintain, and continually improve an EMS in accordance with this standard.

CLAUSE 5 - LEADERSHIP

5.1 Leadership and Commitment
Top management shall demonstrate leadership by:
(a) taking accountability for effectiveness of the EMS
(b) ensuring environmental policy and objectives are established
(c) ensuring integration of EMS into business processes
(d) ensuring resources are available
(e) communicating importance of effective environmental management
(f) ensuring intended outcomes are achieved
(g) directing and supporting persons to contribute to effectiveness
(h) promoting continual improvement

5.2 Environmental Policy
Top management shall establish an environmental policy that:
(a) is appropriate to the purpose and context of the organization
(b) provides framework for setting environmental objectives
(c) includes commitment to protection of the environment
(d) includes commitment to fulfill compliance obligations
(e) includes commitment to continual improvement of the EMS

CLAUSE 6 - PLANNING

6.1 Actions to Address Risks and Opportunities
6.1.1 The organization shall establish processes to determine potential environmental aspects of activities, products, and services.

6.1.2 Environmental Aspects
The organization shall determine environmental aspects that have or can have significant environmental impact, considering:
- Emissions to air
- Releases to water
- Releases to land
- Use of raw materials and natural resources
- Use of energy
- Energy emitted (heat, radiation, vibration, noise, light)
- Generation of waste
- Use of space

6.1.3 Compliance Obligations
The organization shall determine and have access to compliance obligations related to its environmental aspects.

6.1.4 Planning Action
The organization shall plan actions to address significant environmental aspects, compliance obligations, and risks/opportunities.

6.2 Environmental Objectives and Planning to Achieve Them
Environmental objectives shall be:
(a) consistent with environmental policy
(b) measurable (if practicable)
(c) monitored
(d) communicated
(e) updated as appropriate

CLAUSE 7 - SUPPORT

7.1 Resources - Organization shall determine and provide resources needed for EMS
7.2 Competence - Ensure persons are competent based on education, training, or experience
7.3 Awareness - Persons shall be aware of environmental policy, significant aspects, and their contribution
7.4 Communication - Establish internal and external communication processes
7.5 Documented Information - Create, update, and control documented information

CLAUSE 8 - OPERATION

8.1 Operational Planning and Control
The organization shall establish, implement, control, and maintain processes needed to meet EMS requirements by:
(a) establishing operating criteria for processes
(b) implementing control of processes in accordance with operating criteria

8.2 Emergency Preparedness and Response
The organization shall establish, implement, and maintain processes for responding to potential emergency situations and potential environmental impacts.

CLAUSE 9 - PERFORMANCE EVALUATION

9.1 Monitoring, Measurement, Analysis, and Evaluation
The organization shall monitor, measure, analyze, and evaluate environmental performance by determining:
(a) what needs to be monitored and measured
(b) methods for monitoring, measurement, analysis, and evaluation
(c) criteria against which performance will be evaluated
(d) when monitoring and measuring shall be performed
(e) when results shall be analyzed and evaluated

9.1.2 Evaluation of Compliance
The organization shall evaluate fulfillment of its compliance obligations at planned intervals.

9.2 Internal Audit
The organization shall conduct internal audits at planned intervals to provide information on whether the EMS conforms to requirements and is effectively implemented.

9.3 Management Review
Top management shall review the organization's EMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness.

CLAUSE 10 - IMPROVEMENT

10.1 General - The organization shall determine opportunities for improvement
10.2 Nonconformity and Corrective Action - React to nonconformities, take action, and address consequences
10.3 Continual Improvement - Continually improve the suitability, adequacy, and effectiveness of the EMS`
  },
  {
    id: 'paris-agreement',
    name: 'Paris Agreement - Climate Change & Net-Zero Commitments',
    shortName: 'Paris Agreement',
    description: 'International treaty on climate change adopted in 2015, requiring parties to take action to limit global warming to 1.5°C above pre-industrial levels.',
    icon: <Leaf className="h-6 w-6" />,
    category: 'Environmental',
    keyRequirements: [
      'Net-Zero Targets',
      'Nationally Determined Contributions (NDCs)',
      'GHG Emissions Reduction',
      'Climate Finance',
      'Adaptation Measures',
      'Transparency Framework',
      'Global Stocktake'
    ],
    extractedText: `PARIS AGREEMENT - CLIMATE CHANGE & NET-ZERO PLEDGES 🌍

ARTICLE 2 - PURPOSE AND TEMPERATURE GOALS

2.1 This Agreement aims to strengthen the global response to climate change by:
(a) Holding the increase in global average temperature to well below 2°C above pre-industrial levels and pursuing efforts to limit the temperature increase to 1.5°C above pre-industrial levels
(b) Increasing the ability to adapt to the adverse impacts of climate change and foster climate resilience and low greenhouse gas emissions development
(c) Making finance flows consistent with a pathway towards low greenhouse gas emissions and climate-resilient development

ARTICLE 3 - NATIONALLY DETERMINED CONTRIBUTIONS (NDCs)

3.1 All Parties shall undertake and communicate ambitious efforts as nationally determined contributions (NDCs) to the global response to climate change.
3.2 NDCs shall represent a progression beyond the Party's then current NDC and reflect its highest possible ambition.
3.3 Developed country Parties should continue taking the lead by undertaking economy-wide absolute emission reduction targets.

ARTICLE 4 - MITIGATION

4.1 Parties aim to reach global peaking of greenhouse gas emissions as soon as possible.
4.2 Parties shall pursue domestic mitigation measures with the aim of achieving the objectives of their NDCs.
4.3 Each Party's successive NDC will represent a progression beyond previous NDC.
4.4 Developed country Parties shall continue taking the lead by undertaking economy-wide absolute emission reduction targets.
4.5 Support shall be provided to developing country Parties for implementation.

NET-ZERO REQUIREMENTS:
- Achieve net-zero CO2 emissions by 2050
- Reduce emissions by 45% from 2010 levels by 2030
- Rapid phase-out of coal power generation
- Transition to 100% renewable electricity by 2035 (developed countries)
- Halt deforestation and land degradation
- Scale up carbon removal technologies

ARTICLE 5 - CARBON SINKS AND RESERVOIRS

5.1 Parties should take action to conserve and enhance sinks and reservoirs of greenhouse gases, including forests.
5.2 Parties are encouraged to implement and support:
- REDD+ (Reducing Emissions from Deforestation and Forest Degradation)
- Joint mitigation and adaptation approaches
- Non-carbon benefits of sustainable forest management

ARTICLE 6 - CARBON MARKETS AND COOPERATION

6.1 Parties may pursue voluntary cooperation in the implementation of their NDCs.
6.2 Internationally Transferred Mitigation Outcomes (ITMOs):
- Must promote sustainable development
- Ensure environmental integrity
- Apply robust accounting to avoid double counting
- Deliver overall mitigation in global emissions

6.4 Mechanism to contribute to mitigation and support sustainable development:
- Established to contribute to the mitigation of GHG emissions
- Generate emission reductions for use by another Party
- Deliver an overall mitigation in global emissions

ARTICLE 7 - ADAPTATION

7.1 Parties hereby establish the global goal on adaptation of enhancing adaptive capacity, strengthening resilience, and reducing vulnerability to climate change.
7.2 Parties shall engage in adaptation planning including:
- National adaptation plans
- Climate risk and vulnerability assessments
- Monitoring and evaluation of adaptation actions
- Building resilience of socioeconomic and ecological systems

ARTICLE 9 - CLIMATE FINANCE

9.1 Developed country Parties shall provide financial resources to assist developing country Parties with respect to both mitigation and adaptation.
9.3 Developed countries intend to jointly mobilize USD 100 billion per year by 2020 through 2025.
9.5 Prior to 2025, establish a new collective quantified goal from a floor of USD 100 billion per year.

ARTICLE 13 - TRANSPARENCY FRAMEWORK

13.1 Enhanced transparency framework for action and support:
- Report on national inventory of anthropogenic emissions
- Progress toward implementing and achieving NDCs
- Climate change impacts and adaptation
- Financial, technology transfer, and capacity-building support provided

ARTICLE 14 - GLOBAL STOCKTAKE

14.1 Global stocktake every five years to assess collective progress toward:
- Long-term goals of the Agreement
- Consider mitigation, adaptation, and means of implementation
- Inform Parties in updating their NDCs

COMPLIANCE MECHANISMS FOR ORGANIZATIONS:
1. Science-Based Targets Initiative (SBTi) alignment
2. Task Force on Climate-related Financial Disclosures (TCFD) reporting
3. Carbon neutrality certification
4. Scope 1, 2, and 3 emissions accounting and reduction
5. Climate risk assessment and management
6. Just transition planning for workforce`
  },
  {
    id: 'leed',
    name: 'LEED v4.1 - Leadership in Energy and Environmental Design',
    shortName: 'LEED v4.1',
    description: 'The most widely used green building rating system in the world, providing a framework for healthy, efficient, and cost-saving buildings.',
    icon: <Shield className="h-6 w-6" />,
    category: 'Environmental',
    keyRequirements: [
      'Location & Transportation',
      'Sustainable Sites',
      'Water Efficiency',
      'Energy & Atmosphere',
      'Materials & Resources',
      'Indoor Environmental Quality',
      'Innovation & Regional Priority'
    ],
    extractedText: `LEED v4.1 - LEADERSHIP IN ENERGY AND ENVIRONMENTAL DESIGN 🏗️

CERTIFICATION LEVELS:
- Certified: 40-49 points
- Silver: 50-59 points
- Gold: 60-79 points
- Platinum: 80+ points (110 possible)

CATEGORY 1: LOCATION AND TRANSPORTATION (16 points)

LT Credit: LEED for Neighborhood Development Location (16 pts)
- Project located in LEED-ND Certified development

LT Credit: Sensitive Land Protection (1 pt)
- Avoid development on sensitive land types including prime farmland, floodplains, habitat for threatened species

LT Credit: High Priority Site (2 pts)
- Locate on infill site or brownfield

LT Credit: Surrounding Density and Diverse Uses (5 pts)
- Locate in existing area with immediate access to diverse mix of uses

LT Credit: Access to Quality Transit (5 pts)
- Multiple transit route types with adequate service

LT Credit: Bicycle Facilities (1 pt)
- Short-term and long-term bicycle storage, shower/changing facilities

LT Credit: Reduced Parking Footprint (1 pt)
- Do not exceed minimum local code parking requirements

LT Credit: Green Vehicles (1 pt)
- Electric vehicle charging stations for 5% of parking spaces

CATEGORY 2: SUSTAINABLE SITES (10 points)

SS Prereq: Construction Activity Pollution Prevention (Required)
- Create and implement erosion and sedimentation control plan

SS Credit: Site Assessment (1 pt)
- Complete site survey documenting topography, hydrology, climate, vegetation, soils

SS Credit: Site Development - Protect or Restore Habitat (2 pts)
- Preserve and protect 40% of greenfield or restore 30% of previously developed site

SS Credit: Open Space (1 pt)
- Provide outdoor space ≥ 30% of total site area

SS Credit: Rainwater Management (3 pts)
- Manage rainwater from 95th percentile storm event

SS Credit: Heat Island Reduction (2 pts)
- Use high-reflectance and vegetated surfaces for ≥ 50% of site and roof areas

SS Credit: Light Pollution Reduction (1 pt)
- Meet uplight and light trespass requirements

CATEGORY 3: WATER EFFICIENCY (11 points)

WE Prereq: Outdoor Water Use Reduction (Required)
- Reduce outdoor water by 30% from baseline

WE Prereq: Indoor Water Use Reduction (Required)
- 20% reduction in water use

WE Prereq: Building-Level Water Metering (Required)
- Install permanent water meters

WE Credit: Outdoor Water Use Reduction (2 pts)
- 50-100% reduction from baseline (no potable water for irrigation)

WE Credit: Indoor Water Use Reduction (6 pts)
- 25-50% reduction in water use

WE Credit: Cooling Tower Water Use (2 pts)
- Conduct one-time potable water analysis

WE Credit: Water Metering (1 pt)
- Install permanent water meters for two or more subsystems

CATEGORY 4: ENERGY AND ATMOSPHERE (33 points)

EA Prereq: Fundamental Commissioning and Verification (Required)
EA Prereq: Minimum Energy Performance (Required)
- 5% improvement new construction, 3% major renovation

EA Prereq: Building-Level Energy Metering (Required)
EA Prereq: Fundamental Refrigerant Management (Required)
- No CFC-based refrigerants

EA Credit: Enhanced Commissioning (6 pts)
EA Credit: Optimize Energy Performance (18 pts)
- 6-50% improvement for new construction

EA Credit: Advanced Energy Metering (1 pt)
EA Credit: Demand Response (2 pts)
EA Credit: Renewable Energy Production (3 pts)
- 1-10% of building energy use from on-site renewables

EA Credit: Enhanced Refrigerant Management (1 pt)
EA Credit: Green Power and Carbon Offsets (2 pts)

CATEGORY 5: MATERIALS AND RESOURCES (13 points)

MR Prereq: Storage and Collection of Recyclables (Required)
MR Prereq: Construction and Demolition Waste Management Planning (Required)

MR Credit: Building Life-Cycle Impact Reduction (5 pts)
- Reuse or renovate existing buildings

MR Credit: Building Product Disclosure - EPD (2 pts)
MR Credit: Building Product Disclosure - Sourcing (2 pts)
MR Credit: Building Product Disclosure - Material Ingredients (2 pts)
MR Credit: Construction and Demolition Waste Management (2 pts)

CATEGORY 6: INDOOR ENVIRONMENTAL QUALITY (16 points)

EQ Prereq: Minimum Indoor Air Quality Performance (Required)
EQ Prereq: Environmental Tobacco Smoke Control (Required)

EQ Credit: Enhanced Indoor Air Quality Strategies (2 pts)
EQ Credit: Low-Emitting Materials (3 pts)
EQ Credit: Construction Indoor Air Quality Management Plan (1 pt)
EQ Credit: Indoor Air Quality Assessment (2 pts)
EQ Credit: Thermal Comfort (1 pt)
EQ Credit: Interior Lighting (2 pts)
EQ Credit: Daylight (3 pts)
EQ Credit: Quality Views (1 pt)
EQ Credit: Acoustic Performance (1 pt)

CATEGORY 7: INNOVATION (6 points)

IN Credit: Innovation (5 pts)
IN Credit: LEED Accredited Professional (1 pt)

CATEGORY 8: REGIONAL PRIORITY (4 points)

RP Credit: Regional Priority (4 pts)
- Earn credits addressing geographically-specific priorities`
  },
  {
    id: 'epa-caa',
    name: 'EPA Clean Air Act (42 U.S.C. §7401)',
    shortName: 'EPA Clean Air Act',
    description: 'Comprehensive federal law regulating air emissions from stationary and mobile sources in the United States to protect public health and welfare.',
    icon: <Shield className="h-6 w-6" />,
    category: 'Environmental',
    keyRequirements: [
      'National Ambient Air Quality Standards (NAAQS)',
      'State Implementation Plans (SIPs)',
      'New Source Review (NSR)',
      'Hazardous Air Pollutants (HAPs)',
      'Mobile Source Standards',
      'Acid Rain Program',
      'Title V Permits'
    ],
    extractedText: `EPA CLEAN AIR ACT (42 U.S.C. §7401) - FEDERAL AIR QUALITY REGULATIONS ☁️

TITLE I - AIR POLLUTION PREVENTION AND CONTROL

SECTION 108 - NATIONAL AMBIENT AIR QUALITY STANDARDS (NAAQS)

Criteria Pollutants and Primary Standards:
1. Carbon Monoxide (CO): 9 ppm (8-hour), 35 ppm (1-hour)
2. Lead (Pb): 0.15 μg/m³ (rolling 3-month average)
3. Nitrogen Dioxide (NO₂): 53 ppb (annual), 100 ppb (1-hour)
4. Ozone (O₃): 0.070 ppm (8-hour)
5. Particulate Matter (PM2.5): 12 μg/m³ (annual), 35 μg/m³ (24-hour)
6. Particulate Matter (PM10): 150 μg/m³ (24-hour)
7. Sulfur Dioxide (SO₂): 75 ppb (1-hour)

Secondary Standards: Protect public welfare (visibility, vegetation, buildings)

SECTION 110 - STATE IMPLEMENTATION PLANS (SIPs)

§7410(a) Each State shall adopt and submit a plan providing for implementation, maintenance, and enforcement of primary and secondary NAAQS.

SIP Requirements:
(1) Enforceable emission limitations and control measures
(2) Ambient air quality monitoring/analysis
(3) Enforcement authority including penalty authority
(4) Interstate pollution transport prohibition
(5) Adequate personnel, funding, and authority
(6) Stationary source monitoring and reporting
(7) Emergency powers for imminent endangerment
(8) Provision for revision

SECTION 111 - NEW SOURCE PERFORMANCE STANDARDS (NSPS)

Standards of performance for new stationary sources:
- Best adequately demonstrated technology
- Continuous emission monitoring systems (CEMS)
- Compliance reporting requirements
- Standards for specific source categories

Major Source Categories:
- Electric utilities
- Petroleum refineries
- Chemical manufacturing
- Pulp and paper mills
- Iron and steel production
- Cement manufacturing

TITLE II - EMISSION STANDARDS FOR MOVING SOURCES

SECTION 202 - MOTOR VEHICLE EMISSION STANDARDS

(a) Standards for new motor vehicles:
- Carbon monoxide
- Hydrocarbons
- Nitrogen oxides
- Particulate matter

Light-Duty Vehicle Standards:
- Tier 3 standards (2017+): NOx: 30 mg/mi, PM: 3 mg/mi
- Zero-emission vehicle (ZEV) requirements in certain states

Heavy-Duty Engine Standards:
- NOx: 0.20 g/bhp-hr
- PM: 0.01 g/bhp-hr

SECTION 211 - FUEL AND FUEL ADDITIVES

(c) Lead Phaseout: Prohibition on lead in gasoline
(k) Renewable Fuel Standard (RFS):
- 36 billion gallons renewable fuel by 2022
- Cellulosic biofuel requirements
- Biomass-based diesel requirements

TITLE III - HAZARDOUS AIR POLLUTANTS (HAPs)

SECTION 112 - NATIONAL EMISSION STANDARDS FOR HAPs

(b) List of 188 Hazardous Air Pollutants including:
- Benzene, Toluene, Formaldehyde
- Mercury, Cadmium, Chromium
- Asbestos, Vinyl chloride
- Polycyclic organic matter

(d) Maximum Achievable Control Technology (MACT):
- Major sources: ≥10 tons/year of any single HAP or ≥25 tons/year of any combination
- MACT standards represent maximum degree of emission reduction achievable

SECTION 112(r) - RISK MANAGEMENT PLANS

Facilities using threshold quantities of regulated substances must:
(1) Conduct hazard assessment
(2) Develop prevention program
(3) Develop emergency response program
(4) Submit Risk Management Plan to EPA

TITLE IV - ACID DEPOSITION CONTROL

SECTION 401 - ACID RAIN PROGRAM

(a) Reduce sulfur dioxide emissions by 10 million tons from 1980 levels
(b) Reduce nitrogen oxide emissions by 2 million tons from 1980 levels

Emission Allowance Trading:
- Each allowance permits emission of one ton of SO₂
- Allowances may be banked for future use or traded
- Continuous Emission Monitoring Systems (CEMS) required

TITLE V - PERMITS

SECTION 501 - OPERATING PERMIT PROGRAM

Major Source Operating Permit Requirements:
(a) Emission limitations and standards
(b) Monitoring, recordkeeping, reporting requirements
(c) Inspection and entry requirements
(d) Compliance certification requirements
(e) Permit duration: 5 years maximum

Permit Fees: Sufficient to cover program costs (minimum $25/ton of regulated pollutant)

TITLE VI - STRATOSPHERIC OZONE PROTECTION

SECTION 602 - LISTING OF CLASS I AND CLASS II SUBSTANCES

Class I Substances (Complete Phaseout):
- Chlorofluorocarbons (CFCs)
- Halons
- Carbon tetrachloride
- Methyl chloroform

Class II Substances (Controlled):
- Hydrochlorofluorocarbons (HCFCs)
- Phaseout by 2030

SECTION 608 - REFRIGERANT MANAGEMENT

Requirements for technicians:
- EPA Section 608 certification
- Proper refrigerant recovery and recycling
- Prohibition on venting
- Leak repair requirements for appliances with 50+ lbs refrigerant

ENFORCEMENT (SECTION 113)

Civil Penalties: Up to $37,500 per day per violation
Criminal Penalties:
- Knowing violations: Up to $250,000 and/or 5 years imprisonment (individuals)
- Knowing endangerment: Up to $1,000,000 and/or 15 years imprisonment

Citizen Suits (Section 304):
- Any person may commence civil action against violators
- 60-day notice requirement before filing suit`
  }
];

interface StandardsLibraryProps {
  onSelectStandard: (standard: PresetStandard) => void;
  selectedStandard?: PresetStandard | null;
  onClear?: () => void;
}

export function StandardsLibrary({ onSelectStandard, selectedStandard, onClear }: StandardsLibraryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (selectedStandard) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">The Standard (Regulation/Law)</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
          <Check className="h-5 w-5 text-success" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {selectedStandard.icon}
            </div>
            <div>
              <span className="font-medium text-foreground">{selectedStandard.shortName}</span>
              <p className="text-sm text-muted-foreground">{selectedStandard.name}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">The Standard (Regulation/Law)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select a compliance framework from our library
        </p>
      </div>

      <div className="space-y-3">
        {PRESET_STANDARDS.map((standard) => (
          <div
            key={standard.id}
            className={cn(
              "border rounded-lg transition-all cursor-pointer",
              expanded === standard.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div
              className="flex items-center gap-4 p-4"
              onClick={() => setExpanded(expanded === standard.id ? null : standard.id)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                {standard.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{standard.shortName}</span>
                  <Badge variant="outline" className="text-xs">{standard.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{standard.name}</p>
              </div>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expanded === standard.id && "rotate-90"
                )}
              />
            </div>

            {expanded === standard.id && (
              <div className="px-4 pb-4 space-y-4">
                <p className="text-sm text-muted-foreground">{standard.description}</p>

                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Key Requirements:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {standard.keyRequirements.map((req) => (
                      <Badge key={req} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStandard(standard);
                  }}
                >
                  Use {standard.shortName} as Standard
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { PRESET_STANDARDS };
