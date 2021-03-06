﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AspNetCoreWebApi.Entity
{
    [Table("nfe_st_ipi")]
    public partial class NfeStIpi
    {
        public NfeStIpi()
        {
            //NfeTaxGroup = new HashSet<NfeTaxGroup>();
        }

        [Key][Column("id")][DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Column("name", TypeName = "character varying(255)")]
        public string Name { get; set; }

        //[InverseProperty("CstIpiNavigation")]
        //public ICollection<NfeTaxGroup> NfeTaxGroup { get; set; }
    }
}
