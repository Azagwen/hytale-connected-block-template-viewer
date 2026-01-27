import type * as CCBTA from "./@types/custom_connected_block_template";

export class Template implements CCBTA.CustomConnectedBlockTemplateAsset {
  	[x: string]: unknown;

  	Parent?: string;
  	$Comment?: string;
  	Tags?: { [k: string]: string[]; };

  	ConnectsToOtherMaterials?: boolean;
  	DontUpdateAfterInitialPlacement?: boolean;
  	DefaultShape?: string | undefined;
  	Shapes?: { [k: string]: Shape; };

  	constructor(
		parent: string, 
		comment: string, 
		tags: { [k: string]: string[] }, 
		connectsToOtherMaterials: boolean, 
		dontUpdateAfterFirstPlacement: boolean,
		defaultShape: string,
		shapes: { [k: string]: Shape }
  	) {
		this.Parent = parent;
		this.$Comment = comment;
		this.Tags = tags;
		this.ConnectsToOtherMaterials = connectsToOtherMaterials;
		this.DontUpdateAfterInitialPlacement = dontUpdateAfterFirstPlacement;
		this.DefaultShape = defaultShape;
		this.Shapes = shapes;
  	}
}

export class Shape implements CCBTA.Shape {
  	PatternsToMatchAnyOf?: Pattern[];
  	FaceTags?: CCBTA.FaceTags;

  	constructor(
		patternsToMatch: Pattern[],
		faceTags: CCBTA.FaceTags
  	) {
		this.PatternsToMatchAnyOf = patternsToMatch;
		this.FaceTags = faceTags;
  	}
}

export class Pattern implements CCBTA.Pattern {
  Type?: string
  TransformRulesToOrientation?: boolean
  YawToApplyAddReplacedBlockType?:
	| "Zero"
	| "Ninety"
	| "OneEighty"
	| "TwoSeventy";
  RequireFaceTagsMatchingRoll?: boolean
//   AllowedPatternTransformations?: AllowedPatternTransformations
//   RulesToMatch?: RuleToMatch[]
  OnlyOnPlacement?: boolean
  OnlyOnUpdate?: boolean
	
}