"""Build-time research schema. Unknown values are explicit, never inferred facts."""
FIELDS = '''event_id market issuer_id entity_id event_type event_subtype stage status event_date disclosure_date parties target geography consideration payment_structure ownership_before ownership_after control_result financing conditions_precedent approvals long_stop_date termination governance sources disclosure_changes financial_analysis investment_analysis strategy_analysis legal_analysis comparables action_plan information_gaps next_milestones'''.split()
PROVENANCE = {'disclosed', 'external', 'analysis', 'undisclosed', 'na'}

def field(value=None, prov='undisclosed'):
    if prov not in PROVENANCE:
        raise ValueError(prov)
    return {'value': value, 'prov': prov}

def make_event(**values):
    return {key: values[key] if isinstance(values.get(key), dict) and 'prov' in values[key]
            else field(values[key], 'analysis') if key in values else field() for key in FIELDS}
